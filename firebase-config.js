/**
 * ============================================================================
 * FIREBASE REALTIME MULTIPLAYER & HOSTING CONFIGURATION
 * ============================================================================
 * 
 * Configured for Firebase project: online-game-with-friend
 * Database URL: https://online-game-with-friend-default-rtdb.firebaseio.com
 */

// Shared Firebase Realtime Database & Web App Configuration:
const FIREBASE_CONFIG = Object.freeze({
  apiKey: "AIzaSyBo4iaCnyjSPTAADVUkP4GPvLrMk_T__kg",
  authDomain: "online-game-with-friend.firebaseapp.com",
  databaseURL: "https://online-game-with-friend-default-rtdb.firebaseio.com",
  projectId: "online-game-with-friend",
  storageBucket: "online-game-with-friend.firebasestorage.app",
  messagingSenderId: "286411279396",
  appId: "1:286411279396:web:f44611fa55db346f31dcb1",
  measurementId: "G-CR644YF0M5",
  hostingUrl: ""
});

// Provide backwards compatibility and global window exposure
const firebaseConfig = FIREBASE_CONFIG;
if (typeof window !== "undefined") {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
    window.firebaseConfig = FIREBASE_CONFIG;
}

/**
 * Checks if a hostname represents a local development environment.
 */
function isLocalhostHost(hostname) {
    if (!hostname) return true;
    const h = hostname.toLowerCase();
    return (
        h === "localhost" ||
        h === "127.0.0.1" ||
        h === "0.0.0.0" ||
        h === "::1" ||
        h.endsWith(".local") ||
        (typeof window !== "undefined" && window.location && window.location.protocol === "file:")
    );
}

/**
 * Checks if a Firebase configuration object has been populated with valid credentials.
 */
function isFirebaseConfigured(config) {
    if (!config || typeof config !== "object") return false;

    const url = (config.databaseURL || "").trim();
    const key = (config.apiKey || "").trim();
    const pid = (config.projectId || "").trim();

    // Check mandatory fields
    if (!url || !key || !pid) return false;

    // Detect unconfigured placeholder values
    if (
        url.includes("your-app-id") ||
        url.includes("your-project-id") ||
        url.includes("YOUR-DATABASE-NAME") ||
        url.includes("rps-pro-arena-live-default-rtdb")
    ) {
        return false;
    }

    if (
        key.includes("AIzaSyB-RPSPRO") ||
        key.includes("YOUR-API-KEY") ||
        key.length < 10
    ) {
        return false;
    }

    // Must be a valid secure Firebase database URL
    const isValidUrl = url.startsWith("https://") && (
        url.includes(".firebaseio.com") ||
        url.includes(".firebasedatabase.app")
    );

    return isValidUrl;
}

/**
 * Retrieves the active Firebase configuration.
 * Checks localStorage first (saved via the in-game Cloud Setup modal), then falls back to FIREBASE_CONFIG.
 */
function getActiveFirebaseConfig() {
    try {
        const custom = localStorage.getItem("rps_custom_firebase_config");
        if (custom) {
            const parsed = JSON.parse(custom);
            if (isFirebaseConfigured(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Could not load custom Firebase config from localStorage", e);
    }

    if (typeof FIREBASE_CONFIG !== "undefined" && isFirebaseConfigured(FIREBASE_CONFIG)) {
        return FIREBASE_CONFIG;
    }

    if (typeof window !== "undefined" && window.FIREBASE_CONFIG && isFirebaseConfigured(window.FIREBASE_CONFIG)) {
        return window.FIREBASE_CONFIG;
    }

    return (typeof FIREBASE_CONFIG !== "undefined") ? FIREBASE_CONFIG : null;
}

/**
 * Gets the custom hosting domain (if configured by the user).
 */
function getCustomHostingUrl() {
    try {
        const custom = localStorage.getItem("rps_custom_hosting_url");
        if (custom && custom.trim()) {
            return custom.trim();
        }
    } catch (e) { }

    if (FIREBASE_CONFIG && FIREBASE_CONFIG.hostingUrl && FIREBASE_CONFIG.hostingUrl.trim()) {
        return FIREBASE_CONFIG.hostingUrl.trim();
    }

    return null;
}

/**
 * Saves a custom hosting domain (e.g. https://my-app.vercel.app or custom domain).
 */
function saveCustomHostingUrl(url) {
    try {
        if (!url || !url.trim()) {
            localStorage.removeItem("rps_custom_hosting_url");
        } else {
            localStorage.setItem("rps_custom_hosting_url", url.trim());
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Returns the internet-accessible base URL for invitations.
 * When deployed on Vercel or a live public domain, it automatically resolves to window.location.origin.
 * When in local development, it supports an optional custom URL override (e.g. your Vercel deployment link)
 * or falls back to the local development origin.
 */
function getHostingBaseUrl() {
    const custom = getCustomHostingUrl();
    if (custom) {
        let base = custom.replace(/\/+$/, "");
        if (!base.startsWith("http://") && !base.startsWith("https://")) {
            base = "https://" + base;
        }
        return base;
    }

    if (typeof window !== "undefined" && window.location) {
        return window.location.origin || `${window.location.protocol}//${window.location.host}`;
    }

    return "";
}

/**
 * Parses user input from the Cloud Setup modal.
 * Supports both JSON and pasted JavaScript object snippets (e.g. `const firebaseConfig = { ... };`).
 */
function parseFirebaseConfigInput(rawInput) {
    if (!rawInput || typeof rawInput !== "string") return null;
    let text = rawInput.trim();

    // 1. Try standard JSON.parse
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") return parsed;
    } catch (e) { }

    // 2. Extract object block { ... } if wrapped in variable declaration
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
        text = objMatch[0];
    }

    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object") return parsed;
    } catch (e) { }

    // 3. Safe evaluation for JS object syntax
    try {
        const fn = new Function("return (" + text + ");");
        const res = fn();
        if (res && typeof res === "object") {
            return res;
        }
    } catch (e) { }

    return null;
}

/**
 * Saves custom configuration from the in-game Cloud Setup dialog.
 */
function saveCustomFirebaseConfig(configObj) {
    try {
        localStorage.setItem("rps_custom_firebase_config", JSON.stringify(configObj, null, 2));
        return true;
    } catch (e) {
        console.error("Failed to save custom Firebase config", e);
        return false;
    }
}

/**
 * Clears saved configuration from localStorage.
 */
function resetFirebaseConfig() {
    try {
        localStorage.removeItem("rps_custom_firebase_config");
        localStorage.removeItem("rps_custom_hosting_url");
    } catch (e) { }
}

// Ensure all configuration helpers are attached to window for global access
if (typeof window !== "undefined") {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
    window.firebaseConfig = FIREBASE_CONFIG;
    window.isLocalhostHost = isLocalhostHost;
    window.isFirebaseConfigured = isFirebaseConfigured;
    window.getActiveFirebaseConfig = getActiveFirebaseConfig;
    window.getCustomHostingUrl = getCustomHostingUrl;
    window.saveCustomHostingUrl = saveCustomHostingUrl;
    window.getHostingBaseUrl = getHostingBaseUrl;
    window.parseFirebaseConfigInput = parseFirebaseConfigInput;
    window.saveCustomFirebaseConfig = saveCustomFirebaseConfig;
    window.resetFirebaseConfig = resetFirebaseConfig;
}

// Support CommonJS environments for automated verification
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        FIREBASE_CONFIG,
        firebaseConfig,
        isLocalhostHost,
        isFirebaseConfigured,
        getActiveFirebaseConfig,
        getCustomHostingUrl,
        saveCustomHostingUrl,
        getHostingBaseUrl,
        parseFirebaseConfigInput,
        saveCustomFirebaseConfig,
        resetFirebaseConfig
    };
}
