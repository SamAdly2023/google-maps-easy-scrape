// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
    if (tab.url.includes("google.com/maps")) {
        chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_SIDEBAR" });
    } else {
        chrome.tabs.create({ url: "https://www.google.com/maps/search/" });
    }
});

// Listen for messages from the sidebar or content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ENRICH_DATA') {
        enrichWithGemini(request.data)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep the message channel open for asynchronous response
    }

    if (request.action === 'EXPORT_TO_SHEETS') {
        exportToSheets(request.data)
            .then(url => sendResponse({ success: true, url: url }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function exportToSheets(data) {
    // Get Token
    const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });

    // Create Sheet
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            properties: {
                title: 'Google Maps Leads - ' + new Date().toLocaleString()
            }
        })
    });

    if (!createResponse.ok) {
        const errorBody = await createResponse.text();
        throw new Error(`Failed to create sheet: ${createResponse.status} - ${errorBody}`);
    }

    const sheetData = await createResponse.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    // Prepare Data
    const headers = ['Title', 'Rating', 'Reviews', 'Phone', 'Industry', 'Address', 'Website', 'Maps Link', 'SEO', 'Missing', 'Outreach', 'Email', 'Contact'];
    const values = [headers];
    data.forEach(item => {
        values.push([
            item.title,
            item.rating,
            item.reviewCount,
            item.phone,
            item.industry,
            item.address,
            item.companyUrl,
            item.href,
            item.seo_health || '',
            item.missing_features || '',
            item.outreach_message || '',
            item.email || '',
            item.contact_person || ''
        ]);
    });

    // Append Data
    const appendResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=RAW`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            values: values
        })
    });

    if (!appendResponse.ok) {
        const errorBody = await appendResponse.text();
        throw new Error(`Failed to append data: ${appendResponse.status} - ${errorBody}`);
    }

    return spreadsheetUrl;
}

async function enrichWithGemini(lead) {
    // 1. Use hardcoded API Key
    const apiKey = 'AIzaSyCmT--BEJ5oBXK-x9XW2sJIl5_0Qbd4Pds';

    if (!apiKey) {
        throw new Error('Gemini API Key is missing.');
    }

    // 2. Construct the prompt
    // The prompt should take the scraped business_name, category, and website_url
    // and return a JSON object containing: 'Estimated SEO Health (1-10)', 'Missing Features', and 'Personalized Outreach Message'.

    // Fallback values if data is missing
    const businessName = lead.title || "Unknown Business";
    const category = lead.industry || "Unknown Category";
    const websiteUrl = lead.companyUrl || "No Website";

    // Try to fetch website content for better email/contact extraction
    let websiteText = "";
    if (websiteUrl && websiteUrl !== "No Website") {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
            const webRes = await fetch(websiteUrl, { signal: controller.signal });
            const webHtml = await webRes.text();
            clearTimeout(timeoutId);

            // Simple regex to strip HTML and get some meaningful text
            // We take first 2000 chars to avoid token limits and keep it fast
            websiteText = webHtml.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "")
                .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .substring(0, 2000);
        } catch (e) {
            console.log("Could not fetch website content", e);
        }
    }

    const promptText = `
        Analyze the following business lead:
        Business Name: ${businessName}
        Category: ${category}
        Website: ${websiteUrl}
        Website Content Snippet: ${websiteText}

        Based on this information, provide a JSON object with the following fields:
        1. "seo_health": An integer from 1-10 estimating their SEO health (10 being perfect). If no website, give 0.
        2. "missing_features": A short string listing potential missing features (e.g., "no booking system", "no website", "basic design").
        3. "outreach_message": A personalized cold outreach message (max 2 sentences) offering web development or SEO services, mentioning their name and specific missing features.
        4. "email": Extract a contact email address from the website text if present, otherwise null.
        5. "contact_person": Extract a key contact person's name (founder, owner, manager) from the website text if present, otherwise null.

        Return ONLY the raw JSON object. Do not include markdown formatting like \`\`\`json.
    `;

    // 3. Call the Gemini API
    // Using gemini-2.0-flash as the available model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: promptText
            }]
        }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();

        // 4. Parse the response
        // Gemini returns the text in data.candidates[0].content.parts[0].text
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error('No content generated by Gemini.');
        }

        // Clean up markdown code blocks if present (Gemini sometimes adds them despite instructions)
        let jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonResult = JSON.parse(jsonString);
        return jsonResult;

    } catch (error) {
        console.error('Gemini Enrichment Error:', error);
        // Return a safe error object so the UI doesn't break
        return {
            seo_health: 0,
            missing_features: "Error analyzing",
            outreach_message: "Could not generate message: " + error.message,
            email: null,
            contact_person: null
        };
    }
}
