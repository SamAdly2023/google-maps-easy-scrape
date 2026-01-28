# 🚀 MapLeads AI - Deployment Checklist

## Pre-Deployment (Before Going Live)

### Code & Configuration
- [ ] All dependencies installed: `npm install`
- [ ] `.env.example` matches all required variables
- [ ] `firebase-config.json` is in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] All error handling implemented
- [ ] API endpoints tested locally

### Firebase Setup
- [ ] Firebase project created
- [ ] Service account key generated
- [ ] Database URL configured
- [ ] Authentication enabled
- [ ] Firestore rules configured
- [ ] Storage permissions set

### Security
- [ ] CORS origins configured for production domain
- [ ] Helmet.js security headers enabled
- [ ] Rate limiting considered
- [ ] Input validation on API endpoints
- [ ] Password requirements configured
- [ ] HTTPS enabled (Render auto-provides)

### Testing
- [ ] Admin login works
- [ ] Client login/signup works
- [ ] API endpoints return correct data
- [ ] File uploads work
- [ ] Export to CSV works
- [ ] Export to Google Sheets works
- [ ] Extension scraping works
- [ ] Data persistence verified

---

## Local Development

### Initial Setup
```bash
# Clone repository
git clone <your-repo>
cd google-maps-easy-scrape

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env  # Add your Firebase credentials

# Add Firebase config
# Place firebase-config.json in root directory
```

### Running Locally
```bash
# Start development server with auto-reload
npm run dev

# Server will be available at:
# http://localhost:5000
# Admin: http://localhost:5000/admin
# Client: http://localhost:5000/dashboard
```

### Testing Checklist
- [ ] Server starts without errors
- [ ] Database connection established
- [ ] Admin dashboard loads
- [ ] Client dashboard loads
- [ ] Login/signup works
- [ ] Logout works
- [ ] API calls succeed
- [ ] No console errors

---

## GitHub Preparation

### Repository Setup
```bash
# Initialize git (if not already done)
git init

# Create .gitignore entries
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "firebase-config.json" >> .gitignore
echo ".env.local" >> .gitignore

# Add and commit
git add .
git commit -m "Initial commit: MapLeads AI platform"

# Push to GitHub
git remote add origin <your-github-url>
git branch -M main
git push -u origin main
```

### Repository Checklist
- [ ] Code pushed to GitHub
- [ ] `.gitignore` properly configured
- [ ] README.md present
- [ ] License file included
- [ ] No sensitive data in commits
- [ ] Branch protection enabled (optional)

---

## Render.com Deployment

### Account & Project Setup
- [ ] Render.com account created
- [ ] GitHub account connected to Render
- [ ] Repository authorized
- [ ] Project created

### Service Configuration

#### Step 1: Create Web Service
1. Log in to Render.com
2. Click "New +" → "Web Service"
3. Select your GitHub repository
4. Configure:
   - **Name:** `mapleads-ai` (or your preferred name)
   - **Region:** Choose closest to users
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Render.yaml:** Auto-detected if present

#### Step 2: Environment Variables
Add these in Render Dashboard:

```
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-app.render.com
```

#### Step 3: Deploy
- [ ] Environment variables set
- [ ] Health check path configured: `/health`
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors

### Post-Deployment Verification
- [ ] Service URL generated: `https://your-app.render.com`
- [ ] Service status shows "Live"
- [ ] Health check passes
- [ ] No errors in logs

---

## Post-Deployment Testing

### Essential Checks
```bash
# Test API endpoints
curl https://your-app.render.com/health
curl https://your-app.render.com/api/auth/verify

# Verify dashboards load
# Admin: https://your-app.render.com/admin
# Client: https://your-app.render.com/dashboard
```

### Functionality Testing
- [ ] Admin dashboard loads
- [ ] Client dashboard loads
- [ ] Login works
- [ ] Signup works
- [ ] User data persists
- [ ] Logout works
- [ ] API returns correct data
- [ ] No CORS errors
- [ ] Console clean (no errors)

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] No console warnings
- [ ] Images load properly
- [ ] CSS loads correctly

---

## Custom Domain Setup (Optional)

### Configure Custom Domain
1. In Render Dashboard → Settings
2. Add custom domain (e.g., `mapleads.com`)
3. Get DNS records from Render
4. Update DNS provider with CNAME record
5. Wait for DNS propagation (up to 24 hours)

### Verify Domain
- [ ] DNS records updated
- [ ] HTTPS working on custom domain
- [ ] Redirect from old domain (if applicable)
- [ ] Certificates auto-renewed

---

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] Check Render logs regularly
- [ ] Monitor error rates
- [ ] Track API response times
- [ ] Monitor resource usage (CPU, Memory)
- [ ] Set up alerts for failures

### Regular Tasks
- [ ] Review logs weekly
- [ ] Check for updates to dependencies
- [ ] Test admin/client dashboards
- [ ] Verify backups (Firebase)
- [ ] Update documentation

### Security Maintenance
- [ ] Rotate API keys monthly
- [ ] Review user access permissions
- [ ] Monitor suspicious activity
- [ ] Update security headers
- [ ] Patch vulnerabilities promptly

---

## Troubleshooting

### Deployment Issues

**Build Fails**
- [ ] Check Node version (should be 18+)
- [ ] Verify `package.json` syntax
- [ ] Check for missing dependencies
- [ ] Review build logs

**Service Won't Start**
- [ ] Check environment variables
- [ ] Verify Firebase credentials
- [ ] Check port availability
- [ ] Review application logs

**CORS Errors**
- [ ] Update `ALLOWED_ORIGINS`
- [ ] Restart service
- [ ] Clear browser cache
- [ ] Check origin headers

**Database Issues**
- [ ] Verify Firebase connection
- [ ] Check firestore rules
- [ ] Verify credentials
- [ ] Check network access

### Quick Fixes
```bash
# Restart service (in Render)
# Manual restart in Dashboard → Settings

# View logs
# Render Dashboard → Logs

# Re-deploy
git push origin main  # Auto-deploys if webhook enabled
```

---

## Production Best Practices

### Performance
- [ ] Enable caching headers
- [ ] Compress responses
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Use CDN for static files

### Security
- [ ] Use HTTPS only
- [ ] Set secure cookies
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Log security events

### Reliability
- [ ] Set up error tracking
- [ ] Monitor uptime
- [ ] Configure backups
- [ ] Document procedures
- [ ] Test disaster recovery

### Scaling
- [ ] Monitor resource usage
- [ ] Optimize database queries
- [ ] Consider caching layer
- [ ] Plan for growth
- [ ] Load test application

---

## Launch Checklist - Final Review

Before announcing to users:

- [ ] All tests pass
- [ ] No known bugs
- [ ] Documentation complete
- [ ] Support email configured
- [ ] Error handling in place
- [ ] Analytics configured
- [ ] Backup system working
- [ ] Team trained
- [ ] Emergency procedures documented

---

## Go Live! 🎉

### Announcement
- [ ] Email to users
- [ ] Social media announcement
- [ ] Website updated
- [ ] Documentation published
- [ ] Support team ready

### Day 1 - Active Monitoring
- [ ] Monitor logs constantly
- [ ] Be ready for user feedback
- [ ] Fix critical issues immediately
- [ ] Document any issues
- [ ] Update status page

### First Week
- [ ] Daily log reviews
- [ ] Fix reported bugs
- [ ] Optimize based on usage
- [ ] Monitor performance
- [ ] Gather user feedback

---

## Celebration 🚀

You've successfully:
✅ Built a full-stack application
✅ Deployed to Render.com
✅ Set up professional dashboards
✅ Configured Firebase
✅ Launched to production

**Congratulations! Your platform is live!**

---

## Support & Resources

- **Documentation:** See README_DEPLOYMENT.md
- **Quick Start:** See QUICK_START.md
- **Firebase Help:** https://firebase.google.com/support
- **Render Help:** https://render.com/docs
- **Technical Support:** Check GitHub issues

---

**Last Updated:** January 28, 2026
**Status:** Ready for Production
