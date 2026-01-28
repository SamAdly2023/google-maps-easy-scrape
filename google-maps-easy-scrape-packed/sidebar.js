// Global Variables
let loginView, mainView, googleLoginBtn, authMessage;
let scrapeBtn, downloadBtn, sheetsBtn, resultsTable, limitText, userEmailSpan, logoutBtn;
let adminBtn; // New Admin Button
let scrapedResults = [];
let currentUser = null;

const ADMIN_EMAIL = 'samadly728@gmail.com';
const DAILY_LIMIT = 50;

document.addEventListener('DOMContentLoaded', () => {
    // Auth Elements
    loginView = document.getElementById('login-view');
    mainView = document.getElementById('main-view');
    googleLoginBtn = document.getElementById('googleLoginBtn');
    authMessage = document.getElementById('auth-message');

    // App Elements
    scrapeBtn = document.getElementById('scrapeBtn');
    downloadBtn = document.getElementById('downloadBtn');
    sheetsBtn = document.getElementById('sheetsBtn');
    resultsTable = document.getElementById('resultsTable').querySelector('tbody');
    limitText = document.getElementById('limitText');
    userEmailSpan = document.getElementById('user-email');
    logoutBtn = document.getElementById('logoutBtn');

    // Admin Button
    adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL("admin.html") });
        });
    }

    // Client Button
    const clientBtn = document.getElementById('clientBtn');
    if (clientBtn) {
        clientBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL("client.html") });
        });
    }

    // Initialize Auth Check
    checkAuthState(false);

    // Listen for Scroll Updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'SCROLL_UPDATE') {
            const statusText = document.getElementById('statusText');
            if (statusText) statusText.textContent = message.status;
        }
    });

    // Attach Events
    googleLoginBtn.addEventListener('click', handleGoogleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    scrapeBtn.addEventListener('click', requestScrape);
    downloadBtn.addEventListener('click', () => downloadCsv(scrapedResults));
    sheetsBtn.addEventListener('click', handleExportSheets);

    // Close Button Logic
    const toggleBtn = document.getElementById('toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            // Send message to parent (content script) to hide iframe
            window.parent.postMessage({ action: 'CLOSE_SIDEBAR' }, '*');
        });
    }
});

// --- AUTH HANDLERS ---

function checkAuthState(interactive) {
    chrome.identity.getAuthToken({ interactive: interactive }, function (token) {
        if (chrome.runtime.lastError) {
            console.error("Auth Error:", chrome.runtime.lastError);
            if (interactive) {
                authMessage.textContent = "Login Failed: " + chrome.runtime.lastError.message;
            }
            // Not signed in
            showLoginView();
        } else {
            // Signed in, get user info
            fetchUserInfo(token);
        }
    });
}

function handleGoogleLogin() {
    authMessage.textContent = "Connecting to Google...";
    checkAuthState(true); // Interactive login
}

function fetchUserInfo(token) {
    fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => response.json())
        .then(user => {
            currentUser = user; // Store globally (user.email is available here)
            showMainView(user);
            authMessage.textContent = "";
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
            authMessage.textContent = "Error fetching user info.";
            showLoginView();
        });
}

function showMainView(user) {
    loginView.classList.add('hidden');
    mainView.classList.remove('hidden');
    // Important: Reset display to flex because .hidden removes it, but we need flex for layout
    mainView.style.display = 'flex';

    userEmailSpan.textContent = user.email;

    if (user.email === ADMIN_EMAIL && adminBtn) {
        adminBtn.classList.remove('hidden');
    }

    checkUsage();
}

function showLoginView() {
    mainView.classList.add('hidden');
    loginView.classList.remove('hidden');
}

function handleLogout() {
    chrome.identity.getAuthToken({ 'interactive': false }, function (current_token) {
        if (!chrome.runtime.lastError) {
            chrome.identity.removeCachedAuthToken({ token: current_token }, function () {
                // Also revoke on Google's side to ensure fresh login next time
                fetch('https://accounts.google.com/o/oauth2/revoke?token=' + current_token);
                currentUser = null;
                showLoginView();
            });
        } else {
            showLoginView();
        }
    });
}

// --- APP LOGIC ---

function requestScrape() {
    scrapeBtn.textContent = '...';
    scrapeBtn.disabled = true;

    // Check Limits
    const TODAY = new Date().toDateString();
    chrome.storage.local.get(['scrapeCount', 'scrapeDate'], (data) => {
        let count = data.scrapeCount || 0;
        let date = data.scrapeDate || TODAY;
        if (date !== TODAY) count = 0;

        // Admin Bypass
        const isAdmin = currentUser && currentUser.email === ADMIN_EMAIL;

        if (!isAdmin && count >= DAILY_LIMIT) {
            scrapeBtn.textContent = 'Limit Reached';
            scrapeBtn.disabled = false;
            alert(`Daily limit of ${DAILY_LIMIT} leads reached. Upgrade for more.`);
            return;
        }

        // Proceed if allowed
        performScrape();
    });
}

function performScrape() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'SCRAPE_MAPS' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    scrapeBtn.textContent = 'Retry';
                    scrapeBtn.disabled = false;
                    return;
                }

                if (response && response.success) {
                    scrapedResults = response.data;
                    renderResults(scrapedResults);
                    updateUsageCount(scrapedResults.length);
                }

                scrapeBtn.textContent = 'Scrape';
                scrapeBtn.disabled = false;

                downloadBtn.disabled = false;
                sheetsBtn.disabled = false;
            });
        }
    });
}

function renderResults(data) {
    resultsTable.innerHTML = '';
    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td title="${item.title}">${item.title}</td>
            <td>${item.rating}</td>
            <td id="enrich-${index}"><span class="enrich-badge enrich-pending">Pending...</span></td>
        `;
        resultsTable.appendChild(tr);

        // Enrich
        chrome.runtime.sendMessage({ action: 'ENRICH_DATA', data: item }, (response) => {
            const cell = document.getElementById(`enrich-${index}`);
            if (response && response.success) {
                // Update local data
                scrapedResults[index] = { ...item, ...response.data };
                cell.innerHTML = `<span class="enrich-badge enrich-success">✓ ${(response.data.seo_health || 0)}/10</span>`;
            } else {
                cell.innerHTML = `<span class="enrich-badge enrich-error">Failed</span>`;
            }
        });
    });
}

function handleExportSheets() {
    sheetsBtn.textContent = '...';
    sheetsBtn.disabled = true;

    chrome.runtime.sendMessage({ action: 'EXPORT_TO_SHEETS', data: scrapedResults }, (response) => {
        sheetsBtn.textContent = 'Sheets';
        sheetsBtn.disabled = false;

        if (response && response.success) {
            window.open(response.url, '_blank');
        } else {
            alert('Export failed: ' + (response ? response.error : 'Unknown'));
        }
    });
}

// --- USAGE/TIER LOGIC ---
function checkUsage() {
    // If admin, show unlimited
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
        limitText.textContent = "Unlimited (Admin)";
        limitText.style.color = "green";
        return;
    }

    const TODAY = new Date().toDateString();
    chrome.storage.local.get(['scrapeCount', 'scrapeDate'], (data) => {
        let count = data.scrapeCount || 0;
        let date = data.scrapeDate || TODAY;

        if (date !== TODAY) count = 0;

        limitText.textContent = `${count} / ${DAILY_LIMIT} leads`;
        limitText.style.color = "black";
    });
}

function updateUsageCount(newCount) {
    const TODAY = new Date().toDateString();
    chrome.storage.local.get(['scrapeCount'], (data) => {
        let current = parseInt(data.scrapeCount || 0);
        let count = current + newCount;
        
        // Use callback to ensure UI updates ONLY after storage is saved
        chrome.storage.local.set({ scrapeCount: count, scrapeDate: TODAY }, () => {
             if (chrome.runtime.lastError) {
                console.error("Storage Error:", chrome.runtime.lastError);
                return;
            }
            checkUsage();
        });
    });
}

// CSV Download Logic
function downloadCsv(data) {
    const headers = ['Title', 'Rating', 'Reviews', 'Phone', 'Email', 'Website', 'Industry', 'Address', 'Maps Link', 'SEO Score', 'Missing Features'];
    let csvContent = headers.join(",") + "\n";

    data.forEach(row => {
        const values = [
            row.title,
            row.rating,
            row.reviewCount,
            row.phone,
            row.email || '', // Email (from enrichment) -> Now prioritized column
            row.companyUrl, // Website
            row.industry,
            row.address,
            row.href,
            row.seo_health || '',
            row.missing_features || ''
        ];
        csvContent += values.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mapleads_${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
