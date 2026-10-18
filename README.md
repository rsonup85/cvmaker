# ♠️ Dahla Pakad (Dehla Pakad) — Real Multiplayer Card Game

An authentic, production-grade 4-player trick-taking Indian card game featuring:
- **Offline Play**: 1 Human vs 3 smart AI bots (works 100% offline via PWA).
- **Play With Friends**: Private 4-seat lobby with room codes, shareable invite links, and team arrangements.
- **Quick Play**: Instant online matchmaking queue with atomic 4-player pairings.
- **Authoritative Game Engine**: Pure, deterministic rules decoupled from UI and verified with unit tests.
- **Security & Hand Privacy**: Firestore Security Rules ensure private hands are strictly accessible only by the assigned player.
- **PWA & Android Ready**: Installable Progressive Web App with service worker offline caching and Capacitor mobile packaging instructions.

---

## 🃏 Game Rules Overview

- **Deck**: Standard 52-card deck (Spades ♠, Hearts ♥, Diamonds ♦, Clubs ♣). Ranks: 2 to 10, Jack (11), Queen (12), King (13), Ace (14).
- **Seating & Partnerships**:
  - **Team A**: Player A (Seat 0) + Player C (Seat 2).
  - **Team B**: Player B (Seat 1) + Player D (Seat 3).
- **Dealer Selection ("Koot / Pehla Jack")**: Cards are dealt one-by-one clockwise until the first Jack appears. That player becomes the dealer.
- **Phase 1: Deal 5 Cards & Establish Trump ("Rang Kholna")**:
  - 5 cards dealt to each player.
  - First trick is led; all players must follow suit if they hold the led suit.
  - The first time any player breaks suit (plays off-suit), the suit of that card establishes the **Trump Suit (Rang)**.
- **Phase 2: Deal Rest (13 each) & Court Card Check**:
  - Remaining 32 cards are dealt (4 cards x 2 passes = 8 cards each, total 13 cards per hand).
  - Hands are checked for court cards (J, Q, K, A); a void triggers a fair re-deal.
- **Phase 3: Trick Play & Dahla (10) Collection Mechanics**:
  - Won tricks do not get collected every round; they accumulate in the center table pile.
  - When a **Dahla (10)** is played in a trick, it triggers a **Pending Win** for that trick's winner.
  - To collect the pile containing the Dahla, that player must win the very next trick (2 consecutive trick wins).
  - Once any player collects a Dahla pile, the table switches to the standard rule: any player winning 2 consecutive tricks collects whatever pile is on the table.
  - Any leftover cards at the conclusion of round 13 are collected by the 13th trick winner.
- **Instant Kotha Victory (4 Dahle)**: If one team captures all 4 Dahle, they immediately win the match on the spot!

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/ci.yml       # Automated CI (lint, test, build)
├── public/
│   ├── icon.svg               # Vector brand app icon
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── CardView.tsx        # High-fidelity card face & card backs
│   │   ├── GameOverModal.tsx   # Win celebration with confetti
│   │   ├── GameTable.tsx       # Felt arena, 4-seat layout, trick HUD
│   │   ├── LobbyView.tsx       # Mode select (Offline, Friends, Quick Play)
│   │   ├── OfflineIndicator.tsx# Connectivity status alert
│   │   ├── PWAInstallButton.tsx# Mobile/desktop install prompt
│   │   └── RulesModal.tsx      # Comprehensive Hindi/English rules guide
│   ├── firebase/
│   │   └── config.ts           # Firebase SDK, Auth, Firestore & error handling
│   ├── game/
│   │   ├── engine.ts           # Pure core Dahla Pakad game engine
│   │   └── engine.test.ts      # Unit tests (node:test)
│   ├── hooks/
│   │   └── usePWAInstall.ts    # BeforeInstallPrompt hook
│   ├── services/
│   │   └── multiplayerService.ts # Rooms, matches, matchmaking & sync
│   ├── utils/
│   │   └── sound.ts            # Web Audio API procedural sound synthesizer
│   ├── App.tsx                 # Main application state coordinator
│   └── main.tsx
├── firebase.json              # Firebase Hosting & Emulator configuration
├── firestore.rules            # Hardened Firestore Security Rules
├── firestore.indexes.json     # Query indexing configuration
├── firebase-blueprint.json    # Intermediate schema blueprint
├── security_spec.md           # Security invariants & Dirty Dozen attack audit
└── package.json
```

---

## 🧪 Testing

Run the fast unit test suite covering game rules, follow-suit validation, trick resolution, Dahla pending states, consecutive trick collections, and hand sanitization:

```bash
# Run unit tests
npx tsx --test src/game/engine.test.ts

# Run TypeScript check
npm run lint

# Build production bundle
npm run build
```

---

## 🚀 Step-by-Step Firebase Setup & Deployment

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Name your project (e.g., `dahla-pakad-online`).

### 2. Register Web App
1. Inside your Firebase project settings, click **Add App** and choose the **Web** icon `</>`.
2. Register the app (e.g., `Dahla Pakad Web`).
3. Copy the configuration object values into your local `firebase-applet-config.json` or `.env`.

### 3. Enable Authentication
1. Go to **Authentication** in the Firebase Console sidebar.
2. Under the **Sign-in method** tab, enable:
   - **Anonymous** (allows instant 1-tap multiplayer without passwords).
   - **Google** (optional, for persistent player profiles).

### 4. Create Cloud Firestore
1. Navigate to **Firestore Database** in the console.
2. Click **Create Database**, select your cloud region, and start in **Production mode**.

### 5. Deploy Security Rules & Hosting
Install the Firebase CLI and login:
```bash
npm install -g firebase-tools
firebase login
firebase use --add  # Select your project
```

Deploy firestore rules and hosting:
```bash
# Deploy firestore rules
firebase deploy --only firestore:rules

# Build the client app
npm run build

# Deploy web app to Firebase Hosting
firebase deploy --only hosting
```

---

## 💻 Local Firebase Emulator Suite

To develop and test multiplayer locally without connecting to live cloud servers:

```bash
# Start Firebase emulators (Auth on 9099, Firestore on 8080, UI on 4000)
firebase emulators:start

# In a separate terminal, start Vite dev server
npm run dev
```

---

## 📱 Android App Packaging (PWA & Capacitor)

### Approach 1: Progressive Web App (PWA)
1. Open the deployed website in Chrome on Android.
2. Tap the in-app **Install App** button or Chrome menu **Install app / Add to Home screen**.
3. Dahla Pakad installs as a standalone Android app with full offline support.

### Approach 2: Native Android APK with Capacitor
To build a standalone APK for Google Play Store:

```bash
# 1. Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init "Dahla Pakad" "com.dahlapakad.game" --web-dir dist

# 3. Build production web bundle
npm run build

# 4. Add Android platform
npx cap add android

# 5. Copy web assets to Android project
npx cap copy

# 6. Open in Android Studio to build APK/AAB
npx cap open android
```

---

## 🐙 Pushing to Your GitHub Repository

Execute the following exact Git commands in your terminal:

```bash
# 1. Initialize git if not already initialized
git init

# 2. Add all project files
git add .

# 3. Commit the production multiplayer release
git commit -m "feat: complete Dahla Pakad multiplayer card game with Offline, Friends, and Quick Play"

# 4. Set branch to main
git branch -M main

# 5. Link to your personal GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 6. Push to GitHub
git push -u origin main
```
