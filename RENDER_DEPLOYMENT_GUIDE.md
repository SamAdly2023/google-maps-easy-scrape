# 🚀 Render Deployment Guide - Complete Instructions

## Overview
This guide provides step-by-step instructions to deploy MapLeads AI to Render.com, a modern cloud platform perfect for hosting Node.js applications.

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Render Setup](#render-setup)
3. [Environment Variables](#environment-variables)
4. [Deploying to Render](#deploying-to-render)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Privacy Policy URL](#privacy-policy-url)
7. [Monitoring & Logs](#monitoring--logs)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to Render, verify the following:

- [ ] Firebase project is created and configured
- [ ] Firebase authentication is enabled (Email/Password)
- [ ] Firestore database is created with rules
- [ ] Firebase service account JSON is ready
- [ ] All local tests pass (`npm start` runs without errors)
- [ ] `render.yaml` file exists in project root
- [ ] GitHub repository is created and code is pushed
- [ ] All environment variables documented

---

## Render Setup

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click "Get Started"
3. Sign up with your GitHub account (recommended) or email
4. Verify your email address

### Step 2: Create New Web Service

1. Click **"New +"** button in top right
2. Select **"Web Service"**
3. Choose your GitHub repository:
   - If prompted, connect your GitHub account
   - Select the `google-maps-easy-scrape` repository
   - Select main/master branch
4. Configure the service:
   - **Name:** `mapleads-ai` (or your preferred name)
   - **Region:** Oregon (closest to most US users)
   - **Branch:** main
   - **Runtime:** Node.js
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free tier (can upgrade later)

### Step 3: Advanced Settings

1. Scroll to "Advanced Settings"
2. Toggle **"Auto-Deploy"** to ON
3. Leave other settings as default

---

## Environment Variables

### Step 1: Add Environment Variables to Render

After creating the service, click **"Environment"** in the left sidebar:

1. Click **"Add Environment Variable"**
2. Add each variable below (replace with YOUR actual values):

```
KEY                          VALUE
============================================================
NODE_ENV                     production
PORT                         5000
LOG_LEVEL                    info
FIREBASE_PROJECT_ID          your-firebase-project-id
FIREBASE_PRIVATE_KEY         -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL        firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL        https://your-project.firebaseio.com
ALLOWED_ORIGINS              https://yourdomain.render.com
RENDER_SERVICE_NAME          mapleads-ai
ADMIN_EMAIL                  admin@yourdomain.com
```

### Step 2: Get Firebase Service Account

1. Go to Firebase Console: [console.firebase.google.com](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Click **"Service Accounts"** tab
5. Click **"Generate New Private Key"**
6. Copy the JSON content:
   - `FIREBASE_PROJECT_ID` → `"project_id"`
   - `FIREBASE_PRIVATE_KEY` → `"private_key"` (keep the `\n` escape sequences)
   - `FIREBASE_CLIENT_EMAIL` → `"client_email"`
   - `FIREBASE_DATABASE_URL` → Use your Firestore URL

### Step 3: Important Notes for Private Key

⚠️ **CRITICAL:** When copying the `FIREBASE_PRIVATE_KEY`:

```
WRONG:  -----BEGIN PRIVATE KEY-----xxxxxxx-----END PRIVATE KEY-----
RIGHT:  -----BEGIN PRIVATE KEY-----\nxxxxxxx\n-----END PRIVATE KEY-----
```

- Keep the `\n` newline escape sequences
- Do NOT expand them to actual newlines
- Do NOT remove the `-----BEGIN/END-----` lines
- Paste the entire key as one line

---

## Deploying to Render

### Automatic Deployment (Recommended)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Deploy to Render"
git push origin main
```

2. Render automatically triggers deployment when you push to main branch
3. Watch the **"Logs"** tab to monitor build progress
4. Deployment typically completes in 2-3 minutes

### Manual Deployment

If auto-deploy is not triggering:

1. Go to your Render service dashboard
2. Click **"Manual Deploy"** button (top right)
3. Select **"Deploy latest commit"**
4. Wait for build to complete

---

## Post-Deployment Verification

### Step 1: Check Service Status

1. Go to your Render service dashboard
2. Verify the status shows **"Live"** with a green indicator
3. Your service URL appears at the top: `https://mapleads-ai.render.com`

### Step 2: Test Basic Endpoints

```bash
# Replace with your actual Render URL
RENDER_URL="https://mapleads-ai.render.com"

# Test health check
curl $RENDER_URL/health

# Test metrics endpoint
curl $RENDER_URL/api/health/status

# Test metrics
curl $RENDER_URL/api/metrics
```

### Step 3: Check Logs

1. Click **"Logs"** tab in Render dashboard
2. Look for these success indicators:
```
Server running on port 5000
Firebase initialized successfully
Winston logger configured
Metrics middleware initialized
```

### Step 4: Access Dashboards

Once deployed, access your dashboards:

- **Admin Analytics:** `https://mapleads-ai.render.com/admin/analytics.html`
- **Real-Time Dashboard:** `https://mapleads-ai.render.com/realtime-dashboard.html`
- **Health Status:** `https://mapleads-ai.render.com/api/health/status`

---

## Privacy Policy URL

### Making Privacy Policy Live

Your privacy policy is automatically served by the application:

**Live Privacy Policy URL:**
```
https://mapleads-ai.render.com/privacy-policy.html
```

### Using in Extension

Update your extension manifest to reference the live policy:

#### In `google-maps-easy-scrape/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "MapLeads AI - Google Maps Scraper",
  "version": "1.0.0",
  "permissions": ["activeTab", "scripting", "storage"],
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "images/icon-16.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  },
  "homepage_url": "https://mapleads-ai.render.com",
  "action": {
    "default_popup": "popup.html",
    "default_icon": "images/icon-128.png"
  },
  "host_permissions": [
    "https://www.google.com/*"
  ]
}
```

#### Add to `popup.html`:

```html
<div class="footer">
    <a href="https://mapleads-ai.render.com/privacy-policy.html" target="_blank">
        Privacy Policy
    </a>
    <span>|</span>
    <a href="https://mapleads-ai.render.com/terms-of-service.html" target="_blank">
        Terms of Service
    </a>
</div>
```

---

## Monitoring & Logs

### Real-Time Logs

1. Click **"Logs"** tab in Render dashboard
2. Logs stream in real-time
3. Filter by severity:
   - **ERROR** (red) - Critical issues
   - **WARN** (yellow) - Warnings
   - **INFO** (blue) - General information
   - **DEBUG** (gray) - Detailed debugging

### Setting Log Level

To change logging verbosity, update the `LOG_LEVEL` environment variable:

```
LOG_LEVEL=debug    # Most verbose (use for troubleshooting)
LOG_LEVEL=info     # Standard (recommended for production)
LOG_LEVEL=warn     # Only warnings and errors
LOG_LEVEL=error    # Only errors
```

### Metrics & Monitoring

1. Visit your dashboards:
   - Admin Analytics: `/admin/analytics.html`
   - Real-Time: `/realtime-dashboard.html`

2. Monitor key metrics:
   - **Uptime:** Percentage of time service is running
   - **Build logs:** To check if build succeeded
   - **Runtime logs:** To check if service is responding

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: Build Fails with "Module not found"

**Cause:** Dependencies not installed

**Solution:**
```bash
# Local fix
npm install

# Push to GitHub
git add package-lock.json
git commit -m "Fix dependencies"
git push origin main

# Redeploy from Render dashboard
```

#### Issue 2: "Firebase initialization failed"

**Cause:** Environment variables not set correctly

**Solution:**
1. Check `FIREBASE_PROJECT_ID` is not empty
2. Verify `FIREBASE_PRIVATE_KEY` contains `\n` escape sequences
3. Ensure all Firebase environment variables are set
4. Check Firebase service account has required permissions
5. Go to Render > Environment > verify all variables

#### Issue 3: Service times out after 30 seconds

**Cause:** Build process taking too long or service not responding

**Solution:**
```bash
# Reduce build time
npm ci --production  # Use npm ci for faster installs

# Check start command responds quickly
npm start
```

#### Issue 4: Disk space exceeded

**Cause:** Logs are taking up too much space

**Solution:**
1. Render free tier has 0.5 GB storage
2. Increase `LOG_LEVEL` to "warn" to reduce log volume
3. Or upgrade to paid plan for more storage

#### Issue 5: "Error connecting to Firebase"

**Cause:** Network connectivity or firewall issue

**Solution:**
1. Verify Firebase has Render IP whitelisted
2. Check `FIREBASE_DATABASE_URL` is correct
3. Ensure Firestore is initialized in Firebase Console
4. Check network rules allow external connections

### Debug Mode

To enable full debugging:

1. Set environment variables:
   ```
   LOG_LEVEL=debug
   NODE_ENV=development
   ```

2. Restart service:
   - Render dashboard > Services > Restart Service

3. Check logs for detailed error messages

---

## Custom Domain (Optional)

To use your own domain instead of `.render.com`:

1. Go to Render service dashboard
2. Click **"Settings"** tab
3. Scroll to **"Custom Domain"**
4. Enter your domain (e.g., `mapleads.com`)
5. Add the DNS CNAME record to your domain registrar:
   ```
   CNAME: mapleads.com → mapleads-ai.render.com
   ```
6. Click **"Add Custom Domain"**
7. Wait for DNS propagation (5-30 minutes)

Update your `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://mapleads.com
```

---

## Security Checklist

Before going live, verify:

- [ ] Firebase authentication is required for sensitive endpoints
- [ ] HTTPS is enforced (Render provides this by default)
- [ ] Environment variables are not exposed in logs
- [ ] Database rules restrict unauthorized access
- [ ] Rate limiting is enabled (100 requests/15 minutes)
- [ ] CORS is restricted to your domain only
- [ ] Private key file is never committed to GitHub
- [ ] Admin endpoints require admin authentication
- [ ] Privacy policy is accessible at `/privacy-policy.html`
- [ ] No sensitive data is logged

---

## Scaling (When Traffic Increases)

### Free Plan Limits
- **Memory:** 0.5 GB
- **CPU:** Shared
- **Storage:** 0.5 GB
- **Concurrent Connections:** Limited

### When to Upgrade

Upgrade to paid plan when:
- Service frequently times out
- Build frequently fails due to memory
- Need persistent storage for logs
- Traffic exceeds 100 requests/minute

### Upgrade Steps

1. Render dashboard > Settings > Plan
2. Select desired plan (Standard, Professional)
3. Upgrade features:
   - **Disk:** 2 GB or more
   - **Memory:** 1-4 GB
   - **Persistent disks:** Optional

---

## Maintenance

### Regular Tasks

**Daily:**
- Check health endpoint: `/api/health/status`
- Monitor error logs

**Weekly:**
- Review metrics dashboard
- Check error trends
- Verify backups

**Monthly:**
- Update dependencies: `npm update`
- Review security logs
- Test disaster recovery plan

### Backup Strategy

1. Firebase automatically backs up Firestore data
2. Export metrics monthly:
   ```bash
   curl https://mapleads-ai.render.com/api/metrics/report > metrics-backup.json
   ```

3. Save locally with timestamp

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Express.js Docs:** https://expressjs.com
- **Email Support:** privacy@mapleads.ai
- **GitHub Issues:** Report bugs in your repository

---

## Next Steps

1. ✅ Deploy to Render (follow steps above)
2. ✅ Verify Privacy Policy at `/privacy-policy.html`
3. ✅ Test admin dashboards
4. ✅ Monitor logs for 24 hours
5. ✅ Update extension with Privacy Policy URL
6. ✅ Submit extension to Chrome Web Store

---

**Deployment Status Tracker:**
- [ ] Render account created
- [ ] Service created
- [ ] Environment variables added
- [ ] Code deployed successfully
- [ ] Health check passing
- [ ] Dashboards accessible
- [ ] Privacy policy live
- [ ] Logs being collected
- [ ] Ready for production

**Estimated Setup Time:** 15-20 minutes

Good luck with your deployment! 🎉
