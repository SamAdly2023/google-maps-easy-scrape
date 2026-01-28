# 🚀 COMPLETE LAUNCH GUIDE - From Local to Production

## MapLeads AI: Deploy to Render.com + Chrome Web Store

This is your **complete step-by-step guide** to launch MapLeads AI. Follow these instructions in order.

---

## 📋 Quick Overview

| Step | Task | Time | Status |
|------|------|------|--------|
| 1 | Local Testing | 5 min | ⏳ |
| 2 | Verify Privacy Policy | 2 min | ⏳ |
| 3 | Prepare Extension Package | 5 min | ⏳ |
| 4 | Deploy to Render | 10 min | ⏳ |
| 5 | Configure Render | 5 min | ⏳ |
| 6 | Verify Live Deployment | 5 min | ⏳ |
| 7 | Submit to Chrome Store | 15 min | ⏳ |
| 8 | Monitor & Maintain | ongoing | ⏳ |

**Total Time: ~1-2 hours setup + 1-24 hours for Chrome Web Store approval**

---

## SECTION 1: LOCAL TESTING & VERIFICATION

### Step 1.1: Install Dependencies

```bash
# Navigate to project directory
cd path/to/google-maps-easy-scrape

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

Expected output shows:
```
├── express@4.18.2
├── firebase-admin@12.0.0
├── firebase@12.8.0
├── ws@8.14.2  ← WebSocket (for real-time)
├── helmet@7.1.0
├── cors@2.8.5
├── dotenv@16.3.1
├── winston@3.11.0
├── express-rate-limit@7.1.5
└── express-validator@7.0.1
```

### Step 1.2: Verify All Files Exist

**Check these critical files:**

```bash
# Core backend
✓ server.js
✓ services/analytics.js
✓ services/notifications.js
✓ middleware/metrics.js

# Frontend dashboards
✓ public/admin/analytics.html
✓ public/realtime-dashboard.html
✓ public/js/realtime-client.js
✓ public/privacy-policy.html  ← NEW

# Extension files
✓ google-maps-easy-scrape/manifest.json
✓ google-maps-easy-scrape/popup.html
✓ google-maps-easy-scrape/background.js
✓ google-maps-easy-scrape/content.js
✓ google-maps-easy-scrape/images/icon-*.png

# Configuration
✓ package.json
✓ render.yaml
```

### Step 1.3: Create .env File (Local Testing Only)

Create a file named `.env` in your project root:

```bash
# .env (DO NOT commit to GitHub)

NODE_ENV=development
PORT=5000
LOG_LEVEL=debug

# Get these from Firebase Console
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Allow localhost for testing
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000,http://127.0.0.1:5000
```

**⚠️ IMPORTANT: Never commit .env to GitHub!**

Check `.gitignore` contains:
```
.env
.env.local
.env.*.local
```

### Step 1.4: Test Locally

```bash
# Start the server
npm start

# You should see:
# ✅ Server running on port 5000
# ✅ Firebase initialized successfully
# ✅ Winston logger configured
# ✅ Metrics middleware initialized
```

### Step 1.5: Verify Local Endpoints

Open your browser and test:

```
Health Check:
http://localhost:5000/health

Metrics:
http://localhost:5000/api/metrics

Health Status:
http://localhost:5000/api/health/status

Admin Dashboard:
http://localhost:5000/admin/analytics.html

Real-Time Dashboard:
http://localhost:5000/realtime-dashboard.html

Privacy Policy:
http://localhost:5000/privacy-policy.html
```

**Expected Results:**
- ✅ Health check returns `{status: "OK"}`
- ✅ Metrics returns JSON with metrics data
- ✅ Dashboards load without errors
- ✅ Privacy policy displays properly
- ✅ No errors in browser console

If you see errors, check `terminal` for logs.

### Step 1.6: Test WebSocket Connection

1. Open: http://localhost:5000/realtime-dashboard.html
2. Check for green "Connected" indicator
3. You should see live event stream

---

## SECTION 2: PREPARE PRIVACY POLICY & EXTENSION

### Step 2.1: Verify Privacy Policy

The privacy policy is already created at:
```
public/privacy-policy.html
```

**This file contains:**
- ✅ Data collection practices
- ✅ Security measures
- ✅ User rights & GDPR/CCPA compliance
- ✅ Contact information
- ✅ Google Maps API compliance notice
- ✅ Professional formatting

**No action needed** - it's ready to serve from Render!

### Step 2.2: Package Extension

#### Option A: Automatic (Recommended)

**Windows:**
```bash
build-extension.bat
```

**Mac/Linux:**
```bash
chmod +x build-extension.sh
./build-extension.sh
```

This creates: `mapleads-ai-extension-1.0.0.zip`

#### Option B: Manual

**Windows (PowerShell):**
```powershell
# Navigate to folder
cd google-maps-easy-scrape

# Create ZIP
Compress-Archive -Path . -DestinationPath ..\mapleads-ai-extension.zip

# Verify
Get-ChildItem -Path ..\mapleads-ai-extension.zip -Recurse | Select-Object Name
```

**Mac/Linux:**
```bash
cd google-maps-easy-scrape
zip -r ../mapleads-ai-extension.zip .
```

**Verify ZIP contains:**
```
manifest.json
popup.html, popup.js
background.js
content.js
sidebar.html, sidebar.js, sidebar.css
admin.html, client.html
images/
  icon-16.png
  icon-48.png
  icon-128.png
  icon-256.png
```

### Step 2.3: Update manifest.json

Verify your `google-maps-easy-scrape/manifest.json` contains:

```json
{
  "manifest_version": 3,
  "name": "MapLeads AI - Google Maps Business Scraper",
  "version": "1.0.0",
  "description": "Extract Google Maps business data with one click",
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["https://www.google.com/*"],
  "background": { "service_worker": "background.js" },
  "action": {
    "default_popup": "popup.html",
    "default_icon": "images/icon-128.png"
  },
  "icons": {
    "16": "images/icon-16.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png",
    "256": "images/icon-256.png"
  }
}
```

---

## SECTION 3: DEPLOY TO RENDER

### Step 3.1: Prepare GitHub

Push your code to GitHub:

```bash
# From project root
git add .
git commit -m "Prepare for Render deployment - Final version with privacy policy"
git push origin main
```

**Make sure to push:**
- ✅ All source files
- ✅ public/privacy-policy.html
- ✅ render.yaml
- ✅ package.json & package-lock.json

**Make sure NOT to push:**
- ❌ .env file (in .gitignore)
- ❌ node_modules/ (in .gitignore)
- ❌ Firebase private keys

### Step 3.2: Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Verify your email

### Step 3.3: Create Web Service

1. Click **"New +"** in Render dashboard
2. Select **"Web Service"**
3. Connect your GitHub account
4. Select `google-maps-easy-scrape` repository
5. Configure:
   - **Name:** `mapleads-ai`
   - **Region:** Oregon
   - **Branch:** main
   - **Runtime:** Node.js
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (can upgrade later)

### Step 3.4: Add Environment Variables

In Render dashboard, go to **Environment** and add:

| Key | Value | Notes |
|-----|-------|-------|
| NODE_ENV | production | - |
| PORT | 5000 | - |
| LOG_LEVEL | info | Use `debug` for troubleshooting |
| FIREBASE_PROJECT_ID | your-project-id | From Firebase Console |
| FIREBASE_PRIVATE_KEY | -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY----- | Keep `\n` escape sequences! |
| FIREBASE_CLIENT_EMAIL | firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com | - |
| FIREBASE_DATABASE_URL | https://your-project.firebaseio.com | - |
| ALLOWED_ORIGINS | https://mapleads-ai.render.com | Or your custom domain |

**Getting Firebase Credentials:**

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Click ⚙️ (Project Settings)
4. Click "Service Accounts" tab
5. Click "Generate New Private Key"
6. Copy the JSON:
   - `project_id` → FIREBASE_PROJECT_ID
   - `private_key` → FIREBASE_PRIVATE_KEY (keep the `\n`)
   - `client_email` → FIREBASE_CLIENT_EMAIL

### Step 3.5: Enable Auto-Deploy

- Scroll to "Advanced Settings"
- Toggle "Auto-Deploy" ON
- Save settings

### Step 3.6: Monitor Build

Once you create the service, Render automatically deploys your code:

1. Click on your service
2. Go to **"Logs"** tab
3. Watch for:
   ```
   ✅ Installing dependencies...
   ✅ Running build...
   ✅ Build successful
   ✅ Starting server...
   ✅ Server running on port 5000
   ```

**Build takes 2-3 minutes.** ☕

---

## SECTION 4: VERIFY LIVE DEPLOYMENT

Once build completes, verify everything works:

### Test 1: Health Check

Visit: `https://mapleads-ai.render.com/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-01-28T12:00:00.000Z"
}
```

### Test 2: API Metrics

Visit: `https://mapleads-ai.render.com/api/metrics`

Expected response:
```json
{
  "scrapes": {
    "total": 0,
    "successful": 0,
    "failed": 0,
    "inProgress": 0
  },
  "requests": {...},
  "users": {...},
  ...
}
```

### Test 3: Admin Dashboard

Visit: `https://mapleads-ai.render.com/admin/analytics.html`

**Should show:**
- ✅ Dashboard loads
- ✅ No console errors
- ✅ Charts display
- ✅ Real-time updates every 30 seconds

### Test 4: Real-Time Dashboard

Visit: `https://mapleads-ai.render.com/realtime-dashboard.html`

**Should show:**
- ✅ Dashboard loads
- ✅ WebSocket connection shows "Connected"
- ✅ Green pulsing dot (connection indicator)
- ✅ Event stream displays

### Test 5: Privacy Policy

Visit: `https://mapleads-ai.render.com/privacy-policy.html`

**Should show:**
- ✅ Professional privacy policy
- ✅ All sections visible
- ✅ Proper formatting
- ✅ Contact information

### Test 6: Check Logs

In Render dashboard:
1. Click "Logs"
2. Verify no RED errors
3. Look for INFO/SUCCESS messages

**Good signs:**
```
✅ Server running on port 5000
✅ Metrics middleware initialized
✅ Analytics service initialized
```

**Bad signs:**
```
❌ Error connecting to Firebase
❌ Cannot read property...
❌ Port already in use
```

---

## SECTION 5: PUBLISH TO CHROME WEB STORE

### Step 5.1: Create Developer Account

1. Go to https://chrome.google.com/webstore/devconsole
2. Click "Create a new item"
3. Pay $5 one-time developer fee
4. Provide payment details

### Step 5.2: Submit Extension

1. Click **"Upload"**
2. Select your ZIP file: `mapleads-ai-extension-1.0.0.zip`
3. Wait for upload (1-2 minutes)

### Step 5.3: Fill Extension Details

**Name:**
```
MapLeads AI - Google Maps Business Scraper
```

**Short Description** (132 chars max):
```
Extract Google Maps business data instantly. Easy scraping with smart exports.
```

**Full Description:**
```
MapLeads AI - Extract Google Maps Business Data Easily

Turn Google Maps into a powerful business intelligence tool. 
Export leads, addresses, phone numbers, websites, and ratings instantly.

✨ KEY FEATURES:
• One-click scraping from Google Maps
• Export to CSV, JSON, or Excel
• Bulk download of business information
• Real-time data validation
• Privacy-first (data stored locally)
• Secure & encrypted transmission

📊 PERFECT FOR:
• Lead generation
• Market research
• Competitive analysis
• Local SEO optimization
• Business development

🔒 PRIVACY & SECURITY:
• Data stored locally on your device
• Enterprise-grade encryption
• No tracking or data sharing
• See our Privacy Policy

Version 1.0.0
```

### Step 5.4: Upload Images

Prepare these images:

**1. Icon (128x128 PNG)**
- Use: `google-maps-easy-scrape/images/icon-128.png`

**2. Screenshot (1280x800 or 640x400)**
- Show your popup with search results
- Highlight key features

**3. Promotional Tile (440x280)**
- Logo + key benefit
- Professional quality

**Upload all images in the form**

### Step 5.5: Add Privacy Policy URL

In the extension submission form:

**Privacy Policy URL:**
```
https://mapleads-ai.render.com/privacy-policy.html
```

**Permissions Justification:**

For each permission listed, explain:
```
activeTab - Required to access the current Google Maps page
scripting - Required to inject our data extraction script
storage - Required to save your account info
host_permissions - Required to interact with Google Maps
```

### Step 5.6: Submit for Review

1. Review all information
2. Click **"Submit for review"**
3. Confirm submission

**Google reviews extensions in 1-24 hours.**

---

## SECTION 6: AFTER SUBMISSION

### While Waiting for Approval

**You'll get an email when:**
- ✅ Extension is published (can take 1-24 hours)
- ❌ Extension is rejected (see feedback)

### If Approved ✅

1. Extension appears in Chrome Web Store
2. You get a public URL
3. Share with users!

### If Rejected ❌

1. Read rejection reason carefully
2. Fix the issue
3. Resubmit with updated version (1.0.1)

**Common rejections:**
- Missing privacy policy URL → Add it
- Misleading claims → Update description
- Unclear permissions → Justify better

---

## SECTION 7: AFTER LAUNCH

### Monitor Your Service

**Every Day:**
```bash
# Check health
curl https://mapleads-ai.render.com/health

# Check metrics
curl https://mapleads-ai.render.com/api/metrics

# Review Render logs
# Go to: Render dashboard > Logs
```

**Every Week:**
- Check user reviews on Chrome Web Store
- Respond to negative feedback
- Fix reported bugs quickly
- Review analytics dashboard

**Every Month:**
- Update dependencies: `npm update`
- Review security logs
- Plan new features

### Update Your Extension

When you make improvements:

```bash
# 1. Update version in manifest.json
# "version": "1.0.0" → "1.0.1"

# 2. Rebuild extension
build-extension.bat  # or build-extension.sh

# 3. Push code to GitHub
git add .
git commit -m "Version 1.0.1 - Bug fixes"
git push

# 4. Upload to Chrome Web Store
# Go to: Chrome Web Store > Upload new package
# Select: mapleads-ai-extension-1.0.1.zip
# Click: Submit for review

# 5. Update goes live in 30-60 minutes
```

### Scaling Your Service

If you exceed free tier limits:

1. Upgrade Render plan: Small ($7/month)
2. Add more resources:
   - Increase Memory: 0.5 GB → 1 GB
   - Increase Disk: 0.5 GB → 2 GB
   - Add: Persistent disk storage

---

## TROUBLESHOOTING

### Render Build Fails

**Error: "Module not found"**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Reinstall dependencies"
git push
```

**Error: "Firebase initialization failed"**
- Check all FIREBASE_* variables are set
- Verify FIREBASE_PRIVATE_KEY has `\n` escape sequences
- Check Firebase service account has correct permissions

### Deployment is Slow

**Service taking > 30 seconds to start:**
```
• Render free tier has limited resources
• Upgrade to Small plan for better performance
• Or optimize code (remove unnecessary logs)
```

### Privacy Policy Not Loading

**Error: 404 on /privacy-policy.html**
- Check file exists: `public/privacy-policy.html`
- Rebuild and redeploy
- Wait for deploy to complete

### WebSocket Connection Fails

**"WebSocket connection failed"**
- Check real-time dashboard shows red X
- This is OK for free tier (limited resources)
- Upgrade Render plan for stable WebSocket
- Or refresh page

---

## FINAL CHECKLIST

Before considering launch complete:

- [ ] Server runs locally without errors
- [ ] All endpoints respond correctly
- [ ] Privacy policy is live
- [ ] Extension packages correctly
- [ ] Render deployment successful
- [ ] All dashboards load and update
- [ ] Health check passes
- [ ] Chrome Web Store submission accepted
- [ ] Extension appears in store
- [ ] Privacy policy URL is correct
- [ ] First user can install and use

---

## 🎉 CONGRATULATIONS!

You've successfully:
1. ✅ Built a production-grade backend
2. ✅ Created professional dashboards
3. ✅ Deployed to production (Render)
4. ✅ Published browser extension (Chrome Web Store)
5. ✅ Implemented privacy & security

**Your MapLeads AI platform is now live!** 🚀

---

## SUPPORT & RESOURCES

**Documentation Files:**
- [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) - Detailed Render guide
- [CHROME_EXTENSION_PACKAGING.md](CHROME_EXTENSION_PACKAGING.md) - Detailed Chrome Web Store guide
- [FINAL_LAUNCH_CHECKLIST.md](FINAL_LAUNCH_CHECKLIST.md) - Complete pre-launch checklist

**External Resources:**
- Render Docs: https://render.com/docs
- Chrome Extensions: https://developer.chrome.com/docs/extensions/
- Firebase: https://firebase.google.com/docs

**Email Support:**
- privacy@mapleads.ai

---

**Last Updated:** January 28, 2026  
**Version:** 1.0 - Complete Launch Guide
