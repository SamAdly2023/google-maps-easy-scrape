# 🔑 HOW TO GET FIREBASE CREDENTIALS

## Quick Steps to Get Your Firebase Private Key

### Step 1: Go to Firebase Console
Open: https://console.firebase.google.com

### Step 2: Select Your Project
- Click on your project name (or create a new project)

### Step 3: Access Project Settings
- Click the ⚙️ (gear icon) next to "Project Overview"
- Click "Project settings"

### Step 4: Go to Service Accounts
- Click on the "Service Accounts" tab at the top

### Step 5: Generate Private Key
- Scroll down to "Firebase Admin SDK"
- Click "Generate new private key"
- Click "Generate key" in the confirmation dialog
- A JSON file will download automatically

### Step 6: Extract Values from JSON

Open the downloaded JSON file. It looks like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "xxxxx",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/..."
}
```

### Step 7: Map to Environment Variables

Copy these values to Render environment variables:

| Render Variable | JSON Field | Example |
|----------------|------------|---------|
| `FIREBASE_PROJECT_ID` | `project_id` | `my-project-123` |
| `FIREBASE_PRIVATE_KEY` | `private_key` | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_CLIENT_EMAIL` | `client_email` | `firebase-adminsdk-xxx@...` |
| `FIREBASE_DATABASE_URL` | Manual | `https://my-project-123.firebaseio.com` |

---

## ⚠️ CRITICAL: Private Key Format

When copying `FIREBASE_PRIVATE_KEY` to Render:

### ✅ CORRECT (Keep the \n as-is):
```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...\n-----END PRIVATE KEY-----\n
```

### ❌ WRONG (Don't expand \n to actual newlines):
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BA...
-----END PRIVATE KEY-----
```

**Copy the entire string INCLUDING the `\n` characters as literal text!**

---

## For Local Testing (.env file)

If testing locally, create a `.env` file:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BA...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

**Note:** Use quotes around the private key in .env file!

---

## Alternative: Use Firebase Config File (Local Only)

Instead of environment variables for local testing, you can:

1. Save the entire downloaded JSON as `firebase-config.json`
2. Place it in your project root
3. Add to `.gitignore` (NEVER commit this file!)
4. The server.js will automatically load it

**⚠️ WARNING:** Never commit `firebase-config.json` or `.env` to GitHub!

---

## Troubleshooting

### Issue: "Firebase initialization failed"
- Check that all environment variables are set in Render
- Verify the private key has `\n` characters (not actual newlines)
- Ensure no extra spaces before/after the key

### Issue: "Invalid private key format"
- The key must start with `-----BEGIN PRIVATE KEY-----`
- The key must end with `-----END PRIVATE KEY-----`
- Keep all `\n` characters as literal `\n` (two characters)

### Issue: "Permission denied"
- Go to Firebase Console > IAM & Admin
- Verify the service account has "Firebase Admin" role
- Or add these roles:
  - Firebase Admin
  - Cloud Datastore User

---

## Firebase Database URL

To get `FIREBASE_DATABASE_URL`:

**For Firestore (Cloud Firestore):**
```
https://[PROJECT_ID].firebaseio.com
```

Replace `[PROJECT_ID]` with your actual project ID from Firebase Console.

**Example:**
- Project ID: `mapleads-ai-2024`
- Database URL: `https://mapleads-ai-2024.firebaseio.com`

---

## Quick Reference: All Firebase Environment Variables

```
NODE_ENV=production
PORT=5000
FIREBASE_PROJECT_ID=[from JSON: project_id]
FIREBASE_PRIVATE_KEY=[from JSON: private_key - keep \n as-is]
FIREBASE_CLIENT_EMAIL=[from JSON: client_email]
FIREBASE_DATABASE_URL=https://[PROJECT_ID].firebaseio.com
ALLOWED_ORIGINS=https://mapleads-ai.render.com
```

---

## Need Help?

1. Can't find Firebase Console? → https://console.firebase.google.com
2. Don't have a Firebase project? → Create one first in Firebase Console
3. JSON file not downloading? → Check browser's download folder
4. Still having issues? → Check RENDER_DEPLOYMENT_GUIDE.md for more details

---

**That's it! You now have all your Firebase credentials ready for Render deployment.** 🎉
