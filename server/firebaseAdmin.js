import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let app;

function cleanEnv(value) {
  return String(value || '').trim().replace(/^\"|\"$/g, '');
}

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  // Preferred on Vercel: one JSON secret. Keep the three-variable form for
  // existing deployments as a fallback.
  const rawJson = cleanEnv(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  if (rawJson) {
    try {
      const serviceAccount = JSON.parse(rawJson);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = String(serviceAccount.private_key).replace(/\\n/g, '\n');
      }
      app = initializeApp({ credential: cert(serviceAccount) });
      return app;
    } catch (error) {
      throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT_JSON: ${error.message}`);
    }
  }

  const projectId = cleanEnv(process.env.FIREBASE_PROJECT_ID);
  const clientEmail = cleanEnv(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = cleanEnv(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase server credentials missing. Configure FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY in Vercel.');
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

export function db() { return getFirestore(getAdminApp()); }
export function adminAuth() { return getAuth(getAdminApp()); }
export { FieldValue };
