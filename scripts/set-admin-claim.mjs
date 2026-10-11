import fs from 'node:fs';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/set-admin-claim.mjs admin@example.com');
  process.exit(1);
}

let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = cert(JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')));
} else {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) throw new Error('Provide GOOGLE_APPLICATION_CREDENTIALS or Firebase server credential environment variables.');
  credential = cert({ projectId, clientEmail, privateKey });
}

const app = getApps().length ? getApps()[0] : initializeApp({ credential });
const auth = getAuth(app);
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
console.log(`Admin claim set for ${email}. Ask the user to sign out/in again so the new ID token contains admin=true.`);
