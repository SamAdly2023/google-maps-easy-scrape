// Node 18+ has native fetch
const webhookUrl = "https://services.leadconnectorhq.com/hooks/tbWaBmRj1ai6VJlNz3VY/webhook-trigger/DSFHrUO71Lptpvh4qKMW";

const payload = {
    eventType: 'email.notification.test',
    timestamp: new Date().toISOString(),
    messageSubject: 'Your Activation Key is Ready',
    messageHtml: `
        <div style="font-family: sans-serif;">
            <h2>Welcome to MapLeads AI!</h2>
            <p>Here is your activation license key:</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 18px;">
                sk_live_TEST_KEY_99999
            </div>
            <p>Please keep this key safe.</p>
        </div>
    `,
    data: {
        userId: 'sample-user-123',
        leadName: 'Acme Coffee',
        leadEmail: 'hello@acmecoffee.com',
        status: 'active',
        activationLicenseKey: "sk_live_TEST_KEY_99999"
    }
};

console.log("Sending payload (V2) to:", webhookUrl);

fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
    .then(async response => {
        console.log("Response status:", response.status);
        const text = await response.text();
        console.log("Response body:", text);
    })
    .catch(error => {
        console.error("Error sending webhook:", error);
    });
