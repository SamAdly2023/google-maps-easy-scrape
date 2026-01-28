# How to Restore Firebase & Connect Your Dashboard

To make your **Admin Dashboard** work and track user data, you need to set up Firebase again.

## Step 1: Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** -> Name it "MapLeads AI".
3. Disable Google Analytics (optional, keeps it simple).
4. Click **Create Project**.

## Step 2: Enable Authentication
1. In the sidebar, click **Build** -> **Authentication**.
2. Click **Get Started**.
3. Select **Google** -> Enable it.
4. Set the support email to your email (`samadly728@gmail.com`).
5. Click **Save**.

## Step 3: Enable Database (Firestore)
1. In the sidebar, click **Build** -> **Firestore Database**.
2. Click **Create Database**.
3. Choose a location (e.g., `us-central1`).
4. **Important:** Start in **Test Mode** (allow all reads/writes for 30 days) to make testing easy.
   *(Later we will secure this)*.

## Step 4: Get Your Config
1. Click the **Gear Icon** (Project Settings).
2. Scroll down to **Your apps**.
3. Click the **Web (</>)** icon.
4. Register app (Name: "MapLeads Web").
5. You will see a code block with `firebaseConfig`.
6. **Copy only the `const firebaseConfig = { ... }` part.**

## Step 5: Update Your Files
1. Open `website/admin.html` in VS Code.
2. Paste the config into the `firebaseConfig` variable (Replace lines 15-22).
3. Open the file in your browser to test the login!

## Step 6: Deploying the Website
To put this online so people can buy it:
1. Create an account on [Vercel.com](https://vercel.com) (Free).
2. Install Vercel CLI or upload your `website` folder.
3. It will give you a URL like `mapleads-ai.vercel.app`.
