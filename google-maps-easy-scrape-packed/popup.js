document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTab = tabs[0];
        var actionButton = document.getElementById('actionButton');
        var downloadCsvButton = document.getElementById('downloadCsvButton');
        var resultsTable = document.getElementById('resultsTable');
        var filenameInput = document.getElementById('filenameInput');

        if (currentTab && currentTab.url.includes("://www.google.com/maps/search")) {
            document.getElementById('message').textContent = "Let's scrape Google Maps!";
            actionButton.disabled = false;
            actionButton.classList.add('enabled');
        } else {
            var messageElement = document.getElementById('message');
            messageElement.innerHTML = '';
            var linkElement = document.createElement('a');
            linkElement.href = 'https://www.google.com/maps/search/';
            linkElement.textContent = "Go to Google Maps Search.";
            linkElement.target = '_blank';
            messageElement.appendChild(linkElement);

            actionButton.style.display = 'none';
            downloadCsvButton.style.display = 'none';
            filenameInput.style.display = 'none';
        }

        actionButton.addEventListener('click', function () {
            checkLimits(function (allowed) {
                if (!allowed) return;

                actionButton.textContent = "Scraping...";
                actionButton.disabled = true;

                // Send message to content script
                chrome.tabs.sendMessage(currentTab.id, { action: 'SCRAPE_MAPS' }, function (response) {
                    actionButton.textContent = "Scrape Google Maps";
                    actionButton.disabled = false;

                    if (chrome.runtime.lastError) {
                        alert("Please refresh the Google Maps page to initialize the scraper.");
                        console.error(chrome.runtime.lastError);
                        return;
                    }

                    if (response && response.success) {
                        var results = response.data;

                        // Update Usage
                        updateUsage(results.length);

                        while (resultsTable.firstChild) {
                            resultsTable.removeChild(resultsTable.firstChild);
                        }

                        // Define and add headers to the table
                        const headers = ['Title', 'Rating', 'Reviews', 'Phone', 'Industry', 'Address', 'Website', 'Google Maps Link', 'SEO Health', 'Missing Features', 'Outreach Message', 'Email', 'Contact Person'];
                        const headerRow = document.createElement('tr');
                        headers.forEach(headerText => {
                            const header = document.createElement('th');
                            header.textContent = headerText;
                            headerRow.appendChild(header);
                        });
                        resultsTable.appendChild(headerRow);

                        if (!results || results.length === 0) {
                            alert('No results found. Try scrolling the map list.');
                            return;
                        }

                        downloadCsvButton.disabled = false;

                        // Add new results to the table
                        results.forEach(function (item) {
                            var row = document.createElement('tr');

                            // Standard Fields
                            ['title', 'rating', 'reviewCount', 'phone', 'industry', 'address', 'companyUrl', 'href'].forEach(function (key) {
                                var cell = document.createElement('td');
                                if (key === 'reviewCount' && item[key]) {
                                    item[key] = item[key].replace(/\(|\)/g, '');
                                }
                                cell.textContent = item[key] || '';
                                row.appendChild(cell);
                            });

                            // Enrichment Fields (Placeholders)
                            const seoCell = document.createElement('td');
                            seoCell.textContent = '...';
                            seoCell.style.color = 'gray';
                            row.appendChild(seoCell);

                            const missingCell = document.createElement('td');
                            missingCell.textContent = '...';
                            missingCell.style.color = 'gray';
                            row.appendChild(missingCell);

                            const outreachCell = document.createElement('td');
                            outreachCell.textContent = '...';
                            outreachCell.style.color = 'gray';
                            row.appendChild(outreachCell);

                            const emailCell = document.createElement('td');
                            emailCell.textContent = '...';
                            emailCell.style.color = 'gray';
                            row.appendChild(emailCell);

                            const contactCell = document.createElement('td');
                            contactCell.textContent = '...';
                            contactCell.style.color = 'gray';
                            row.appendChild(contactCell);

                            resultsTable.appendChild(row);

                            // Trigger Enrichment Background Process
                            chrome.runtime.sendMessage({ action: 'ENRICH_DATA', data: item }, function (enrichResponse) {
                                if (enrichResponse && enrichResponse.success) {
                                    const enriched = enrichResponse.data;

                                    seoCell.textContent = enriched.seo_health;
                                    seoCell.style.color = 'black';

                                    missingCell.textContent = enriched.missing_features;
                                    missingCell.style.color = 'black';

                                    outreachCell.textContent = enriched.outreach_message;
                                    outreachCell.style.color = 'black';

                                    emailCell.textContent = enriched.email || 'N/A';
                                    emailCell.style.color = 'black';

                                    contactCell.textContent = enriched.contact_person || 'N/A';
                                    contactCell.style.color = 'black';
                                } else {
                                    const err = enrichResponse ? enrichResponse.error : 'Error';
                                    console.error("Enrichment error:", err);
                                    seoCell.textContent = 'Failed';
                                    missingCell.textContent = 'Failed';
                                    outreachCell.textContent = 'Failed';
                                    emailCell.textContent = 'Failed';
                                    contactCell.textContent = 'Failed';
                                }
                            });
                        });
                    }
                });
            });
        });

        downloadCsvButton.addEventListener('click', function () {
            var csv = tableToCsv(resultsTable);
            var filename = filenameInput.value.trim();
            if (!filename) {
                filename = 'google-maps-data-enriched.csv';
            } else {
                filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.csv';
            }
            downloadCsv(csv, filename);
        });

    });
});

// Convert the table to a CSV string
function tableToCsv(table) {
    var csv = [];
    var rows = table.querySelectorAll('tr');

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');

        for (var j = 0; j < cols.length; j++) {
            // Escape double quotes
            var data = cols[j].innerText.replace(/"/g, '""');
            row.push('"' + data + '"');
        }
        csv.push(row.join(','));
    }
    return csv.join('\n');
}

// Download the CSV file
function downloadCsv(csv, filename) {
    var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], { type: 'text/csv' });
    downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function checkLimits(callback) {
    const TODAY = new Date().toDateString();
    
    // Check local storage for free tier usage
    chrome.storage.local.get(['scrapeDate', 'scrapeCount', 'userTier'], function(data) {
        let count = data.scrapeCount || 0;
        let date = data.scrapeDate || TODAY;
        let tier = data.userTier || 'free';
        
        let limit = 10;
        if (tier === 'starter') limit = 33; // ~1000/mo
        if (tier === 'pro') limit = 166;    // ~5000/mo
        if (tier === 'enterprise') limit = 999999;

        if (date !== TODAY) {
            // New day, reset count
            count = 0;
            chrome.storage.local.set({ scrapeDate: TODAY, scrapeCount: 0 });
        }

        if (count >= limit) {
             const upgradeMsg = 'Daily Limit Reached (' + limit + ' leads). Please upgrade your plan.';
             alert(upgradeMsg);
             callback(false);
        } else {
             callback(true);
        }
    });
}

function updateUsage(newLeadsCount) {
    const TODAY = new Date().toDateString();
    chrome.storage.local.get(['scrapeCount'], function(data) {
        let count = data.scrapeCount || 0;
        chrome.storage.local.set({ 
            scrapeDate: TODAY, 
            scrapeCount: count + newLeadsCount 
        });
        
        // Update UI status
        const statusEl = document.getElementById('userStatus');
        if(statusEl) {
             statusEl.textContent = 'Used: ' + (count + newLeadsCount) + ' (Reset: ' + TODAY + ')';
        }
    });
}

