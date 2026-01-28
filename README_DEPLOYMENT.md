# MapLeads AI - Professional Google Maps Data Extraction Platform

A comprehensive solution for extracting business data from Google Maps with professional admin and client dashboards, deployable on Render.com.

## 🎯 Features

### Browser Extension
- 🔍 Extract business names, ratings, and contact information from Google Maps
- 📊 Real-time data enrichment with AI
- 📥 Export data to CSV and Google Sheets
- 🎨 Enhanced, modern UI with smooth animations
- 🔐 Secure Firebase authentication

### Admin Dashboard
- 📈 Real-time statistics and analytics
- 👥 User management interface
- 📊 Charts and data visualization
- ⚙️ System settings and configuration
- 🔐 Role-based access control

### Client Dashboard
- 📋 View all your scraping history
- 💾 Manage and export data
- 👤 Account settings and billing
- 📊 Personal usage statistics
- 🔗 API key management

## 📁 Project Structure

```
google-maps-easy-scrape/
├── server.js                          # Express backend server
├── package.json                       # Dependencies and scripts
├── render.yaml                        # Render.com deployment config
├── .env.example                       # Environment template
│
├── public/
│   ├── admin/                        # Admin dashboard
│   │   ├── index.html               # Admin main page
│   │   └── login.html               # Admin login
│   └── client/                       # Client dashboard
│       ├── index.html               # Client main page
│       └── login.html               # Client login
│
├── google-maps-easy-scrape/          # Chrome extension
│   ├── manifest.json                # Extension manifest
│   ├── sidebar.html                 # Enhanced sidebar UI
│   ├── sidebar.css                  # Modern styling
│   ├── sidebar.js                   # Sidebar logic
│   ├── content.js                   # Content script
│   ├── background.js                # Background worker
│   └── popup.html                   # Extension popup
│
└── FIREBASE_SETUP_V2.md             # Firebase setup guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Render.com account (free tier available)
- Firebase project

### Installation

1. **Clone and Setup**
```bash
cd google-maps-easy-scrape
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

3. **Firebase Setup**
- Create a Firebase project at [firebase.google.com](https://firebase.google.com)
- Generate service account key
- Save as `firebase-config.json` in root directory
- Update `.env` with your Firebase URLs

4. **Local Development**
```bash
npm run dev
# Server runs on http://localhost:5000
# Admin Dashboard: http://localhost:5000/admin
# Client Dashboard: http://localhost:5000/dashboard
```

## 📦 Deploying on Render.com

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Create Render Service
1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `mapleads-ai`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 3: Set Environment Variables
In Render dashboard, add these environment variables:
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NODE_ENV=production
ALLOWED_ORIGINS=https://your-domain.render.com
```

### Step 4: Deploy
1. Click **Create Web Service**
2. Render will automatically deploy
3. Your app is live at: `https://your-domain.render.com`

### Custom Domain (Optional)
1. Go to **Settings** → **Custom Domain**
2. Add your custom domain
3. Update DNS records as instructed

## 🔐 Security Best Practices

- ✅ All credentials stored in environment variables
- ✅ Firebase Admin SDK for server-side operations
- ✅ CORS enabled only for approved origins
- ✅ Token-based authentication for API endpoints
- ✅ HTTPS enforced in production
- ✅ Helmet.js for security headers

## 📡 API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token

### Admin Routes (Protected)
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - List all users

### Client Routes (Protected)
- `GET /api/client/data` - Get user's scrapes
- `POST /api/client/scrape` - Save scrape results

## 🔧 Configuration

### Firebase Configuration
Update `server.js` with your Firebase config:
```javascript
const serviceAccount = require('./firebase-config.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});
```

### CORS Settings
Modify allowed origins in `server.js`:
```javascript
cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true
})
```

## 📊 Dashboard Features

### Admin Dashboard
- Real-time user statistics
- Scrape activity tracking
- User management
- System health monitoring
- API configuration

### Client Dashboard
- Personal scrape history
- Data export options
- Account management
- Billing information
- API key generation

## 🎨 UI Enhancements

### Extension Sidebar
- Modern gradient backgrounds
- Smooth animations and transitions
- Enhanced icons and visual hierarchy
- Responsive tooltip system
- Improved button states
- Better status indicators
- Optimized scrollbar styling

### Dashboards
- Professional dark theme
- Animated statistics cards
- Interactive charts (Chart.js)
- Responsive grid layouts
- Smooth page transitions
- Loading states and animations

## 🚢 Production Checklist

Before deploying to production:

- [ ] Update Firebase project IDs
- [ ] Configure custom domain
- [ ] Set strong environment variables
- [ ] Test all authentication flows
- [ ] Verify API endpoints
- [ ] Test export functionality
- [ ] Monitor server logs
- [ ] Set up backup systems
- [ ] Configure error tracking
- [ ] Test on multiple browsers

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check Node version
node --version  # Should be 18+

# Clear node_modules
rm -rf node_modules
npm install

# Check environment variables
cat .env
```

### Firebase Auth Issues
- Verify service account key is valid
- Check database URL format
- Ensure Firebase project is active

### CORS Errors
- Update `ALLOWED_ORIGINS` in `.env`
- Restart server after changes
- Clear browser cache

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Render.com Deployment](https://render.com/docs)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Support

For issues and questions:
1. Check documentation
2. Review error messages
3. Contact support team
4. Check GitHub issues

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure Firebase credentials
3. ✅ Test locally: `npm run dev`
4. ✅ Deploy to Render: Follow deployment section
5. ✅ Monitor and maintain

---

**Built with ❤️ using Node.js, Express, and Firebase**
