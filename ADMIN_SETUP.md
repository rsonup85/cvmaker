# Production setup — GitHub + Vercel + Firebase Spark + Razorpay + Gemini

## Important billing architecture
This version intentionally does **not** use Firebase Cloud Functions, because Cloud Functions requires the Firebase Blaze plan. Firebase Spark remains free for Authentication and Firestore. Vercel hosts the React frontend and the two Node.js API functions under `/api`.

For a real paid/commercial launch, review Vercel's current plan terms. Vercel Hobby is restricted to personal/non-commercial use; a paid commercial site should use an eligible Vercel plan.

## GitHub
Commit the project source, including:
- `src/`
- `api/`
- `server/`
- `public/`
- `scripts/`
- `firebase.json`
- `firestore.rules`
- `package.json`
- `package-lock.json`
- `.env.example`
- `.firebaserc.example`
- `README.md`

Never commit:
- `.env`
- Firebase service-account JSON
- Razorpay secret
- Gemini API key
- Vercel credentials

## Firebase Spark
1. Create a Firebase project.
2. Keep the project on Spark if you want Firebase itself to remain no-cost.
3. Add a Web App and copy its public config to Vercel environment variables.
4. Authentication → Sign-in method → enable Email/Password.
5. Authentication → Users → create your admin user.
6. Firestore Database → Create database → Production mode.
7. Deploy the included rules with Firebase CLI: `firebase deploy --only firestore:rules`.
8. Project settings → Service accounts → Generate a new private key. Keep the JSON private; it is used only to obtain the three Firebase Admin values for Vercel.

## Vercel environment variables
Public frontend variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_SITE_URL`

Server-only variables:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional; default `gemini-3.8-flash`. New keys cannot use `gemini-2.5-flash`.)
- `ENTITLEMENT_SECRET`

After changing Vercel variables, redeploy.

## Firebase Admin claim
The Admin panel requires a Firebase Auth user with the custom claim `admin=true`.
Use a trusted local machine, never the browser:

`npm install`

Then either set `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account.json` and run:

`npm run admin:claim -- admin@example.com`

or provide `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` locally and run the same command.

Sign out and sign back in to Firebase after the claim is added.

## Razorpay
1. Create/activate your Razorpay account.
2. For testing use Test keys; switch to Live keys only at launch.
3. Put the key ID/secret in Vercel server-only variables.
4. Create a webhook pointing to:
   `https://YOUR-VERCEL-DOMAIN/api/razorpay-webhook`
5. Set the same webhook secret in `RAZORPAY_WEBHOOK_SECRET`.
6. Subscribe to `payment.captured` and `order.paid`.
7. Redeploy after setting variables.

## Gemini
Create a Gemini API key and store it only as the Vercel `GEMINI_API_KEY` server variable. Never use a `VITE_GEMINI_API_KEY` variable.

## Production flow
Browser → Vercel `/api/server` → Firebase Admin/Firestore + Razorpay/Gemini.
Browser → Firebase Auth for admin login only.
Razorpay → Vercel `/api/razorpay-webhook` → Firestore.
