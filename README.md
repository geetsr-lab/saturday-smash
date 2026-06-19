# 🏸 Saturday Smash — Badminton League App

A mobile-first web app to track your weekly badminton group.  
Built with React + Vite + Firebase Firestore + Tailwind CSS.

---

## ✅ Features

- 📊 Live Leaderboard (wins, losses, win %)
- 🏸 Record matches with winner selection
- 🔥 Win streak tracking
- 🏆 MVP display
- 📋 Match history (newest first)
- ⚡ Realtime sync (all devices update instantly)
- 🔐 Admin PIN protection for data entry

---

## 🚀 Run Locally — Step by Step

### Step 1: Install Node.js
Download from https://nodejs.org (choose LTS version)

### Step 2: Set up Firebase

1. Go to https://console.firebase.google.com
2. Click **Create a project** → name it `saturday-smash`
3. Disable Google Analytics (optional) → **Create project**
4. Click **Firestore Database** in the left sidebar
5. Click **Create database** → choose **Start in test mode** → pick a location → **Enable**
6. Click the ⚙️ gear icon → **Project settings**
7. Scroll down to **Your apps** → click the `</>` (Web) icon
8. Register app name: `saturday-smash` → **Register app**
9. Copy the `firebaseConfig` values shown on screen

### Step 3: Create your .env file

In the project folder, create a file called `.env` (copy from `.env.example`):

```
VITE_FIREBASE_API_KEY=paste_your_apiKey_here
VITE_FIREBASE_AUTH_DOMAIN=paste_your_authDomain_here
VITE_FIREBASE_PROJECT_ID=paste_your_projectId_here
VITE_FIREBASE_STORAGE_BUCKET=paste_your_storageBucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=paste_your_messagingSenderId_here
VITE_FIREBASE_APP_ID=paste_your_appId_here
VITE_ADMIN_PIN=1234
```

> Change `1234` to your own secret PIN!

### Step 4: Install & Run

```bash
cd saturday-smash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 🌐 Deploy to Vercel (Free Hosting)

### Step 1: Push to GitHub
1. Create a free account at https://github.com
2. Create a new repository called `saturday-smash`
3. Upload or push your project files

### Step 2: Deploy on Vercel
1. Go to https://vercel.com — sign up with GitHub
2. Click **Add New Project**
3. Import your `saturday-smash` repo
4. Click **Environment Variables** and add all 7 variables from your `.env` file
5. Click **Deploy**
6. Done! You'll get a live URL like `saturday-smash.vercel.app`

### Step 3: Share the URL
Share the Vercel URL with everyone in your group.  
Only people who know the Admin PIN can add players or record matches.

---

## 🔐 Admin PIN

Default PIN: **1234**  
Change it in `.env` → `VITE_ADMIN_PIN=your_new_pin`  
You must re-deploy on Vercel after changing it.

---

## 📱 Firebase Security Rules (Optional, Recommended)

After testing, update Firestore rules at Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

> For a private group this is fine. The Admin PIN in the app prevents casual tampering.

---

## 📁 Project Structure

```
saturday-smash/
├── src/
│   ├── components/
│   │   ├── AdminGate.jsx      ← PIN lock modal
│   │   ├── AddPlayer.jsx      ← Add new players
│   │   ├── RecordMatch.jsx    ← Log match results
│   │   ├── Leaderboard.jsx    ← Standings + MVP + Streak
│   │   └── MatchHistory.jsx   ← All past matches
│   ├── hooks/
│   │   └── useFirestore.js    ← Firebase data + realtime listeners
│   ├── lib/
│   │   └── firebase.js        ← Firebase initialization
│   ├── App.jsx                ← Main app + navigation
│   ├── main.jsx               ← React entry point
│   └── index.css              ← Tailwind imports
├── .env                       ← Your Firebase keys (DO NOT commit)
├── .env.example               ← Template for .env
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

Enjoy your Saturday matches! 🏸


Deployment retry
