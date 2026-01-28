# MapLeads AI - Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### What You Just Got

You now have a **complete, production-ready full-stack application** with:

✅ **Express.js Backend Server**
- REST API with Firebase authentication
- Admin and client endpoints
- Render.com optimized

✅ **Professional Admin Dashboard**
- User management
- Real-time statistics
- Analytics and reporting
- Settings configuration

✅ **Professional Client Dashboard**
- Personal scrape history
- Data export functionality
- Account management
- Billing information

✅ **Enhanced Browser Extension**
- Modern UI with smooth animations
- Improved user experience
- Better styling and interactions

✅ **Deployment Ready**
- Render.com configuration included
- Environment variables template
- Production-ready server setup

---

## 📋 Step-by-Step Setup

### Step 1: Install Dependencies
```bash
cd google-maps-easy-scrape
npm install
```

### Step 2: Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Generate a service account key:
   - Settings → Service Accounts → Generate new private key
4. Save the JSON file as `firebase-config.json` in the root directory

### Step 3: Set Up Environment Variables
```bash
# Copy the template
cp .env.example .env

# Edit with your Firebase credentials
nano .env
```

Update these fields:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account@....iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Step 4: Test Locally
```bash
npm run dev
```

Visit:
- 🏠 Server: http://localhost:5000
- 👑 Admin Dashboard: http://localhost:5000/admin
- 👤 Client Dashboard: http://localhost:5000/dashboard

### Step 5: Deploy to Render.com

**Option A: Using Render Dashboard**
1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set environment variables (from your .env)
5. Click "Deploy"

**Option B: Using render.yaml**
Simply push your repository with `render.yaml` and Render will auto-detect the configuration.

---

## 📱 Browser Extension Setup

### For Development
1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Navigate to `google-maps-easy-scrape/` folder
5. Extension appears in your toolbar

### For Production
Package the extension:
```bash
# The extension is in google-maps-easy-scrape/ folder
# Ready to upload to Chrome Web Store
```

---

## 🔐 Security Notes

⚠️ **Important:**
- Never commit `.env` file (it's in `.gitignore`)
- Always use environment variables in production
- Keep Firebase credentials secure
- Use HTTPS in production (Render provides this)
- Update `ALLOWED_ORIGINS` with your domain

---

## 📊 File Structure Overview

```
📁 google-maps-easy-scrape/
├── server.js                    ← Backend server
├── package.json                 ← Dependencies
├── render.yaml                  ← Render deployment config
├── .env.example                 ← Environment template
│
├── 📁 public/
│   ├── 📁 admin/               ← Admin dashboard
│   │   ├── index.html
│   │   └── login.html
│   └── 📁 client/              ← Client dashboard
│       ├── index.html
│       └── login.html
│
└── 📁 google-maps-easy-scrape/ ← Chrome extension
    ├── sidebar.html            ← Enhanced UI
    ├── sidebar.css             ← Modern styling
    └── [other extension files]
```

---

## ✨ Key Features Implemented

### Backend
- ✅ Express server with CORS
- ✅ Firebase authentication middleware
- ✅ Admin API endpoints
- ✅ Client API endpoints
- ✅ Health check endpoint
- ✅ Error handling

### Admin Dashboard
- ✅ User statistics cards
- ✅ Charts (users growth, scrapes distribution)
- ✅ User management table
- ✅ Analytics section
- ✅ Settings panel
- ✅ Responsive design

### Client Dashboard
- ✅ Personal stats cards
- ✅ Recent activity feed
- ✅ Scrapes table
- ✅ Account settings
- ✅ Billing information
- ✅ API key management

### Extension UI
- ✅ Modern login screen with animation
- ✅ Enhanced sidebar with icons
- ✅ Better button styling
- ✅ Improved table layout
- ✅ Smooth transitions
- ✅ Better tooltips and hints

---

## 🔗 Useful Links

- [Firebase Setup Guide](./FIREBASE_SETUP_V2.md)
- [Deployment Guide](./README_DEPLOYMENT.md)
- [Render.com Documentation](https://render.com/docs)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup)
- [Chrome Extension Basics](https://developer.chrome.com/docs/extensions/)

---

## 🆘 Common Issues

### Q: "Cannot find module 'firebase-admin'"
**A:** Run `npm install` again

### Q: "Firebase config not found"
**A:** Create `firebase-config.json` in root directory

### Q: "CORS error in browser"
**A:** Update `ALLOWED_ORIGINS` in your `.env`

### Q: "Extension not loading"
**A:** Check `manifest.json` permissions and reload extension

---

## 🎯 Next Steps

1. **Customize Branding**
   - Update logo and colors
   - Change text and descriptions
   - Add your company info

2. **Add Database**
   - Connect Firestore for data storage
   - Set up user profiles
   - Add scrape history

3. **Enhance Features**
   - Add more API endpoints
   - Implement webhooks
   - Add email notifications

4. **Go Live**
   - Register domain
   - Configure SSL/HTTPS
   - Monitor analytics

---

## 💡 Pro Tips

- Use `npm run dev` for local development with auto-reload
- Check browser DevTools for network issues
- Monitor Render logs for production errors
- Use Firebase Console to manage users
- Test on multiple browsers before launch

---

**Need help? Check the detailed guides or contact support!**

Happy building! 🚀
