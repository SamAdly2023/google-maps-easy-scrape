// Listen for scraper messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SCRAPE_MAPS') {
        // Run async scroll and scrape
        (async () => {
            await performAutoScroll();
            const data = scrapeData();
            sendResponse({ success: true, data: data });
        })();
        return true; // Keep channel open
    }

    if (request.action === 'TOGGLE_SIDEBAR') {
        toggleSidebar();
    }
});

let sidebarIframe = null;

function toggleSidebar() {
    if (sidebarIframe) {
        if (sidebarIframe.style.display === 'none') {
            sidebarIframe.style.display = 'block';
        } else {
            sidebarIframe.style.display = 'none';
        }
        return;
    }

    sidebarIframe = document.createElement('iframe');
    sidebarIframe.id = 'map-leads-sidebar';
    sidebarIframe.style.position = 'fixed';
    sidebarIframe.style.top = '0px';
    sidebarIframe.style.right = '0px';
    sidebarIframe.style.width = '350px';
    sidebarIframe.style.height = '100vh';
    sidebarIframe.style.zIndex = '2147483647';
    sidebarIframe.style.border = 'none';
    sidebarIframe.style.boxShadow = '-5px 0 15px rgba(0,0,0,0.3)';
    sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
    sidebarIframe.allow = "clipboard-write";

    document.body.appendChild(sidebarIframe);
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'CLOSE_SIDEBAR') {
        if (sidebarIframe) sidebarIframe.style.display = 'none';
    }
});


// --- INFINITE SCROLL LOGIC ---

async function performAutoScroll() {
    // Try to find the feed container (it usually has role="feed")
    const feed = document.querySelector('div[role="feed"]');
    if (!feed) return;

    let previousHeight = 0;
    let sameHeightCount = 0;
    const MAX_RETRIES = 5; // Increased retries for better coverage

    // Send start message
    chrome.runtime.sendMessage({ action: 'SCROLL_UPDATE', status: 'Starting Scroll...' });

    while (sameHeightCount < MAX_RETRIES) {
        // Scroll to bottom
        feed.scrollTop = feed.scrollHeight;

        // Notify items count
        const items = feed.querySelectorAll('div[role="article"]').length;
        chrome.runtime.sendMessage({
            action: 'SCROLL_UPDATE',
            status: `Scrolling (${items} found)`
        });

        // Wait for load (randomized)
        await new Promise(r => setTimeout(r, 2000 + Math.random() * 1000));

        const newHeight = feed.scrollHeight;
        if (newHeight === previousHeight) {
            sameHeightCount++;

            // Check for "End of list" text
            if (document.body.innerText.includes("You've reached the end of the list")) {
                break;
            }
        } else {
            previousHeight = newHeight;
            sameHeightCount = 0;
        }
    }

    chrome.runtime.sendMessage({ action: 'SCROLL_UPDATE', status: 'Extracting Data...' });
}


// --- SCRAPING PARSER ---

function scrapeData() {
    const feed = document.querySelector('div[role="feed"]');
    if (!feed) {
        console.warn('MapLeads AI: Feed not found.');
        return [];
    }

    const items = Array.from(feed.querySelectorAll('div[role="article"]'));

    return items.map(item => {
        let link = item.querySelector('a');
        if (!link) return null;

        const textContent = item.innerText;
        let lines = textContent.split('\n');

        // 1. Title
        let title = item.querySelector('.fontHeadlineSmall')?.innerText || lines[0] || 'Unknown';

        // 2. Rating & Reviews
        // Look for aria-label structure like "4.5 stars 100 Reviews"
        let ratingText = item.querySelector('.fontBodyMedium span[role="img"]')?.getAttribute('aria-label') || '';
        let rating = 'N/A';
        let reviewCount = '0';

        if (ratingText) {
            const parts = ratingText.split(' ');
            if (parts.length > 0) rating = parts[0];
            const match = ratingText.match(/\((.*?)\)/) || ratingText.match(/(\d+)\s+Reviews/i);
            if (match) reviewCount = match[1];
        }

        // 3. Phone Number
        let phone = '';
        // Pattern for international and US formats
        const phoneRegex = /((\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4})/;

        // Iterate lines to find phone
        for (let line of lines) {
            if (phoneRegex.test(line) && line.length < 30 && !line.includes('$')) { // filtering out prices
                phone = line.match(phoneRegex)[0];
                break;
            }
        }

        // 4. Website
        let companyUrl = '';
        // Look for the separate "Website" button often present in list view
        const websiteLink = item.querySelector('a[data-value="Website"]');
        if (websiteLink) {
            companyUrl = websiteLink.href;
        } else {
            // Fallback: look for generic links that are not the main map link
            const allLinks = Array.from(item.querySelectorAll('a[href]'));
            for (let a of allLinks) {
                if (!a.href.includes('google.com/maps') && !a.href.includes('google.com/search')) {
                    companyUrl = a.href;
                    break;
                }
            }
        }

        // 5. Industry (heuristic: often 2nd line or after rating)
        let industry = '';
        if (lines.length > 1 && !lines[1].includes(rating) && !lines[1].includes('(')) {
            industry = lines[1];
        }

        return {
            title: title,
            rating: rating,
            reviewCount: reviewCount,
            phone: phone,
            industry: industry,
            address: lines.join(' '), // Raw address context
            companyUrl: companyUrl,
            href: link.href,
        };
    }).filter(i => i !== null);
}
