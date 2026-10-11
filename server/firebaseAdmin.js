/**
 * CVMaker AI - Server-side Firebase Admin Initialization
 * 
 * Supports:
 * - FIREBASE_SERVICE_ACCOUNT_JSON (preferred)
 * - Split: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * - Safe newline normalization for private keys
 * - Never logs private keys or secrets
 */

import admin from 'firebase-admin';

let adminApp = null;
let firestoreDb = null;

export function initFirebaseAdmin() {
  if (adminApp) return { adminApp, firestoreDb };

  try {
    if (admin.apps.length > 0) {
      adminApp = admin.apps[0];
      firestoreDb = adminApp.firestore();
      return { adminApp, firestoreDb };
    }

    // Option A: Full JSON Service Account string
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const credentials = typeof serviceAccountJson === 'string'
        ? JSON.parse(serviceAccountJson)
        : serviceAccountJson;

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(credentials)
      });
      firestoreDb = adminApp.firestore();
      return { adminApp, firestoreDb };
    }

    // Option B: Split Credentials
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      // Normalize escaped newlines
      privateKey = privateKey.replace(/\\n/g, '\n');

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      firestoreDb = adminApp.firestore();
      return { adminApp, firestoreDb };
    }

    console.warn('Firebase Admin: No credentials provided in environment. Database features will operate in local fallback mode.');
    return { adminApp: null, firestoreDb: null };
  } catch (err) {
    console.error('Firebase Admin initialization error:', err.message);
    return { adminApp: null, firestoreDb: null };
  }
}

export function getFirestore() {
  if (!firestoreDb) {
    const res = initFirebaseAdmin();
    return res.firestoreDb;
  }
  return firestoreDb;
}

export function getAuthAdmin() {
  if (!adminApp) {
    const res = initFirebaseAdmin();
    return res.adminApp ? res.adminApp.auth() : null;
  }
  return adminApp.auth();
}
