# CV Maker AI — Production

React/Vite CV builder designed for GitHub → Vercel deployment with Firebase Spark for Authentication/Firestore, Vercel Node.js API functions for server-side payments/AI, Razorpay, and Gemini.

## Architecture
- Frontend: Vite + React on Vercel
- Server API: Vercel Node.js Functions (`/api/server`, `/api/razorpay-webhook`)
- Database/Auth: Firebase Spark (Firestore + Authentication)
- Payments: Razorpay
- AI: Gemini server-side only
- Node: 24.x

## Quick deploy
1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Set the variables from `.env.example` in Vercel.
4. Deploy.
5. Create the Firebase Auth admin user and set its `admin=true` custom claim using `npm run admin:claim -- admin@example.com` from a trusted machine.
6. Deploy Firestore rules with Firebase CLI.
7. Configure the Razorpay webhook to `/api/razorpay-webhook`.

See `ADMIN_SETUP.md` for the complete step-by-step setup.
