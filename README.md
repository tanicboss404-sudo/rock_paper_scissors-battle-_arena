# ⚔️ Rock Paper Scissors Pro | Championship Arena

A futuristic, high-performance web-based **Rock Paper Scissors Championship Arena** featuring **Solo AI Battles**, **2-Player Local Duels**, and **Real-Time Online Multiplayer** powered by Firebase Realtime Database. Includes simultaneous secret lock-ins, shareable room links, live in-game arena comms (chat & quick reactions), procedural Web Audio sound synthesis, 60fps dynamic canvas confetti, and tournament series modes (First to 3, First to 5, Endless).

---

## 🌟 Game Modes

### 🌐 1. Real-Time Online Multiplayer (PvP)
- **Room Generation & Sharing:**
  - Create a private match room with a unique code (e.g. `RPS-784`).
  - Generate a shareable invitation link with **[Copy Link]** and native mobile/desktop **[Share]** buttons.
  - Another player can click the link from any phone, tablet, or PC to immediately enter the arena.
- **Simultaneous Secret Lock-in:**
  - When either player chooses their move, the identity of the weapon stays secret (`🔒 LOCKED IN`) to avoid screen peeking or network sniffing.
  - As soon as both players lock in, a synchronized clash sequence triggers on both screens — shaking the arena, firing clash sound effects, bursting particle sparks, and revealing moves simultaneously!
- **Real-time Synchronized Gameplay:**
  - Scores, rounds, series progress pips, and combat history logs are synchronized across both devices with sub-second latency.
- **Presence & Disconnection Handling:**
  - Powered by Firebase presence (`onDisconnect`). If an opponent drops connection, the arena displays an alert badge (`⚠️ Opponent disconnected. Waiting to reconnect...`).
  - Session recovery via `sessionStorage` ensures accidental page reloads preserve the player's seat and match score.
- **Room Capacity:**
  - Enforces a strict 2-player capacity limit per room (Host & Challenger).
- **Live In-Game Arena Comms (Chat):**
  - Integrated cyber glassmorphic chat drawer with minimize/expand controls and unread message counter (`💬 2`).
  - Real-time messages with role tags (Host [Cyan] & Guest [Purple]).
  - 8 quick-reaction chips: `🗿`, `📄`, `✂️`, `🔥`, `🏆`, `GG!`, `Nice!`, `Rematch?`.

---

### 🤖 2. Solo Arena (vs Smart AI)
- Intelligent, reactive Computer AI that adapts to move patterns.
- Live win streak counter with dynamic flame animations.
- Keyboard shortcuts: <kbd>1</kbd> / <kbd>R</kbd> (Rock), <kbd>2</kbd> / <kbd>P</kbd> (Paper), <kbd>3</kbd> / <kbd>S</kbd> (Scissors).

---

### ⚔️ 3. 2-Player Local Duel (Pass & Play / Split Arena)
- Play against a friend locally on the same device.
- Dual dock with simultaneous secret lock-in.
- **Player 1 Keys:** <kbd>A</kbd> (Rock), <kbd>S</kbd> (Paper), <kbd>D</kbd> (Scissors).
- **Player 2 Keys:** <kbd>J</kbd> or <kbd>←</kbd> (Rock), <kbd>K</kbd> or <kbd>↑</kbd> (Paper), <kbd>L</kbd> or <kbd>→</kbd> (Scissors).

---

## 🏆 Match Series & Championship Tournament
- **Series Modes:** Choose between **First to 3**, **First to 5**, or **Endless Free Play**.
- **Match Point Alerts:** Visual warning when either fighter is one win away from tournament victory.
- **Grand Championship Celebration:** Interactive popup with an animated golden trophy, final score recap, and celebratory confetti showers.

---

## 🔊 Procedural Web Audio Synthesizer
- 100% offline, zero-latency procedural sound effects powered by the HTML5 **Web Audio API** (no external audio files required):
  - Weapon selection chime
  - Secret lock-in confirmation tone
  - Arena impact clash boom
  - Harmonic victory fanfare
  - In-game chat communication pop
- Global audio toggle with **[M]** keyboard shortcut and `localStorage` persistence.

---

## ⚙️ Backend & Firebase Setup

The online multiplayer mode uses **Firebase Realtime Database** via standard CDN scripts (`firebase-app-compat.js` and `firebase-database-compat.js`).

### Step-by-Step Firebase Console Setup:
1. **Create Project**: Go to [Firebase Console](https://console.firebase.google.com/) and click **"Add project"** (or select an existing one).
2. **Create Realtime Database** *(Important: Choose Realtime Database, NOT Cloud Firestore)*:
   - In the left sidebar, click **Build** &rarr; **Realtime Database**.
   - Click **Create Database** and select your preferred region (e.g. `United States (us-central1)`).
   - In the Security Rules step, select **"Start in test mode"**.
   - Under the **Rules** tab, ensure your rules allow read and write access:
     ```json
     {
       "rules": {
         ".read": true,
         ".write": true
       }
     }
     ```
     Click **Publish**.
3. **Register Web App**:
   - Go to **Project Settings** (gear icon next to Project Overview) &rarr; **General**.
   - Under **"Your apps"**, click the Web icon (`</>`), name your app (e.g., `RPS Pro`), and click **Register app**.
   - Copy the `firebaseConfig` object containing:
     - `apiKey`
     - `authDomain`
     - `databaseURL` (e.g. `https://your-project-default-rtdb.firebaseio.com`)
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`
4. **Connect in the Game**:
   - In the game header, click the **"Cloud"** button (or click **"Configure Firebase Backend"** in the Online Lobby).
   - Paste the config into the textarea and click **"Save & Connect"**.
   - The status turns **🟢 Realtime Cloud Connected** and online rooms become immediately playable!
   - Alternatively, you can paste the values directly into [`firebase-config.js`](file:///c:/Users/Nayan%20mondal/OneDrive/Desktop/Stone_Paper_scissors/firebase-config.js).

---

## 🚀 Deploying to Vercel (Recommended Public Hosting)

You can deploy this project to **Vercel** with zero backend infrastructure. All player coordination and real-time syncing run through your configured Firebase Realtime Database (`online-game-with-friend`).

### Option A: Deploy via GitHub (Easiest & Automatic Updates)
1. Push your project folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: Rock Paper Scissors Pro battle arena"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Click **"Import"** next to your GitHub repository.
4. Leave Framework Preset as **"Other"** (Root Directory: `./`).
5. Click **"Deploy"**.
6. Within 20 seconds, your site is live at:
   `https://<your-project-name>.vercel.app`

### Option B: Deploy via Vercel CLI
Run the following directly from your project directory:
```bash
npx vercel
```
Follow the interactive prompts:
- Set up and deploy? **Yes**
- Which scope? *(Select your Vercel account)*
- Link to existing project? **No**
- What's your project's name? **stone-paper-scissors-pro**
- In which directory is your code located? **./**
- Want to modify settings? **No**

When ready for production:
```bash
npx vercel --prod
```

### 🔗 How Shared Invitation Links Work on Vercel
- When you open the game on your Vercel URL (e.g. `https://your-game.vercel.app`), creating a room automatically generates:
  ```
  https://your-game.vercel.app/?room=RPS-XXXX
  ```
- Any friend on mobile (iOS/Android) or PC anywhere in the world can tap the link to join your battle room instantly!
- For local testing on the same computer, the **"Test on this PC (2nd Tab)"** button lets you test both players simultaneously in two tabs.

---

## 🔒 Firebase Realtime Database Security Rules

Your project includes production-ready schema validation rules in [`database.rules.json`](file:///C:/Users/Nayan%20mondal/OneDrive/Desktop/Stone_Paper_scissors/database.rules.json).

To deploy or update rules in Firebase:
1. Open [Firebase Console](https://console.firebase.google.com/) &rarr; select **online-game-with-friend**.
2. In the left menu, click **Build** &rarr; **Realtime Database** &rarr; **Rules** tab.
3. Paste the contents of [`database.rules.json`](file:///C:/Users/Nayan%20mondal/OneDrive/Desktop/Stone_Paper_scissors/database.rules.json) and click **Publish**.

---

## ⌨️ Controls & Keyboard Shortcuts

| Action | Solo & Online Mode | 2-Player Local Duel |
| :--- | :---: | :---: |
| **Player 1: Rock** | `1` or `R` | `A` |
| **Player 1: Paper** | `2` or `P` | `S` |
| **Player 1: Scissors** | `3` or `S` | `D` |
| **Player 2: Rock** | &mdash; | `J` or `Left Arrow (←)` |
| **Player 2: Paper** | &mdash; | `K` or `Up Arrow (↑)` |
| **Player 2: Scissors** | &mdash; | `L` or `Right Arrow (→)` |
| **Toggle Sound** | `M` | `M` |
| **Reset Match** | `Space` | `Space` |
| **Close Modals** | `Escape` | `Escape` |

---

## 📁 File Structure

```plaintext
Stone_Paper_scissors/
├── index.html           # Main entry point (mirrored with rock.html)
├── rock.html            # Battle Arena markup with Solo, 2P, Online & Live Chat
├── rock.css             # Glassmorphic cyberpunk styling & responsive layout
├── rock.js              # Complete Game Controller & Online Multiplayer Manager
├── firebase-config.js   # Firebase Realtime Database configuration helper
├── favicon.svg          # Custom vector arena sword icon
├── README.md            # Comprehensive project documentation
└── image/               # Weapon imagery
    ├── rock.jpg
    ├── paper.jpg
    ├── scissors.jpg
    └── scissors_2.jpg
```

---

## 🚀 How to Run

1. Open `index.html` or `rock.html` directly in any web browser.
2. Or use a local server:
   ```bash
   npx serve .
   ```
3. To test Online Multiplayer on two devices or two browser tabs:
   - Tab 1: Click **"ONLINE DUEL"** &rarr; **"Create Battle Room"** &rarr; Click **"Copy Link"**.
   - Tab 2: Paste the link in another browser window, private tab, or another device.
   - Both players can now battle in real time with synchronized secret move lock-ins and live chat!
