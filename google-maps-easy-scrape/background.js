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
    // SECURITY UPDATE: API Key is now handled by the backend server
    // to prevent exposure in client-side code.
    const BACKEND_URL = "https://mapleads-ai.render.com"; // Ensure this matches your Render URL

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

    // Call the Backend API instead of Gemini directly
    try {
        const response = await fetch(`${BACKEND_URL}/api/enrich`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                businessName,
                category,
                websiteUrl,
                websiteText
            })
        });

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.status}`);
        }

        const jsonResult = await response.json();
        return jsonResult;

    } catch (error) {
        console.error('Enrichment Error:', error);
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
