// Listen for scraper messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SCRAPE_MAPS') {
        const data = scrapeData();
        sendResponse({ success: true, data: data });
    }

    if (request.action === 'TOGGLE_SIDEBAR') {
        toggleSidebar();
    }
});

let sidebarIframe = null;

function toggleSidebar() {
    if (sidebarIframe) {
        // Toggle visibility
        if (sidebarIframe.style.display === 'none') {
            sidebarIframe.style.display = 'block';
        } else {
            sidebarIframe.style.display = 'none';
        }
        return;
    }

    // Create Iframe
    sidebarIframe = document.createElement('iframe');
    sidebarIframe.id = 'map-leads-sidebar';
    sidebarIframe.style.position = 'fixed';
    sidebarIframe.style.top = '0px';
    sidebarIframe.style.right = '0px';
    sidebarIframe.style.width = '350px';
    sidebarIframe.style.height = '100vh';
    sidebarIframe.style.zIndex = '2147483647'; // Max Z-index
    sidebarIframe.style.border = 'none';
    sidebarIframe.style.boxShadow = '-5px 0 15px rgba(0,0,0,0.3)';
    sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
    sidebarIframe.allow = "clipboard-write"; // Allow copying if needed

    document.body.appendChild(sidebarIframe);
}

// Listen for close message from iframe
window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'CLOSE_SIDEBAR') {
        if (sidebarIframe) sidebarIframe.style.display = 'none';
    }
});


// --- SCRAPING LOGIC ---

function scrapeData() {
    // 1. Find the main feed or results container
    // Google Maps classes change often. We look for 'div[role="feed"]'
    const feed = document.querySelector('div[role="feed"]');
    if (!feed) {
        console.warn('MapLeads AI: Feed not found. Use "Search this area" to spawn results.');
        return [];
    }

    const items = Array.from(feed.querySelectorAll('div[role="article"]'));

    return items.map(item => {
        let link = item.querySelector('a');
        if (!link) return null;

        let lines = item.innerText.split('\n');

        let title = item.querySelector('.fontHeadlineSmall')?.innerText || lines[0] || 'Unknown';
        let ratingText = item.querySelector('.fontBodyMedium span[role="img"]')?.getAttribute('aria-label') || '';

        // Extract Rating
        let rating = 'N/A';
        let reviewCount = '0';

        if (ratingText) {
            const parts = ratingText.split(' ');
            if (parts.length > 0) rating = parts[0];
            // Simple regex for parens (5)
            const match = ratingText.match(/\((.*?)\)/);
            if (match) reviewCount = match[1];
        }

        // Phone & Industry (Heuristic scan of text lines)
        let phone = '';
        let industry = '';
        let address = '';

        // Scan lines for phone pattern
        const phoneRegex = /(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

        lines.forEach(line => {
            if (phoneRegex.test(line)) phone = line;
            // Industry is usually the line after rating, or close to top
            // This is tricky without specific classes, but we leave blank if unsure
        });


        return {
            title: title,
            rating: rating,
            reviewCount: reviewCount,
            phone: phone,
            industry: industry, // Placeholder
            address: address, // Placeholder
            companyUrl: '',
            href: link.href,
        };
    }).filter(i => i !== null);
}
