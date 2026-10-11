# Biodata Maker AI — Premium Resume & Marriage Biodata Maker

**Official Production Domain:** `https://www.biodatamaker.store`

A professional, production-grade Indian CV, Resume, Job Biodata, and Marriage Biodata maker with:
- **Exactly 200 Job / Resume Templates** (`job-001` through `job-200`)
- **200+ Auspicious Marriage Biodata Templates** (`marriage-001` through `marriage-200`)
- **Shared Deterministic Pure-JS Catalog** ensuring frontend, admin, and server pricing synchronization
- **Gemini AI Copilot** (ATS optimization, Role Tune, Grammar Polish, Matrimonial completeness review, Smart Bullets)
- **Dual Export Paths**: Instant Free Browser PDF Export & Ultra High-Res Paid Razorpay / Email Delivery
- **Bilingual English & Hindi** support
- **Strict 90-File Project Ceiling** maintained with reusable layout engines.

---

## 🚀 Environment Variables Configuration

Copy `.env.example` to `.env` or set these in your Vercel project settings:

### Public Client Variables (Vite bundles these):
```env
VITE_FIREBASE_API_KEY="AIzaSyYourFirebaseWebApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="cvmaker-ai-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="cvmaker-ai-project"
VITE_FIREBASE_STORAGE_BUCKET="cvmaker-ai-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456789"
VITE_SITE_URL="https://www.biodatamaker.store"
```

### Server-Only Private Variables (Set in Vercel / Cloud Run Environment):
```env
# Gemini AI (REST API integration)
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
GEMINI_MODEL="gemini-3.8-flash"
GEMINI_FALLBACK_MODELS="gemini-2.5-flash,gemini-2.0-flash"

# Razorpay Payments
RAZORPAY_KEY_ID="rzp_test_YourTestKeyId"
RAZORPAY_KEY_SECRET="YourRazorpayKeySecret"
RAZORPAY_WEBHOOK_SECRET="YourRazorpayWebhookSecret"
# Production Webhook Endpoint: https://www.biodatamaker.store/api/razorpay-webhook

# Firebase Admin SDK (Full JSON service account OR split keys)
FIREBASE_SERVICE_ACCOUNT_JSON="{\"type\":\"service_account\",...}"
# OR Split:
# FIREBASE_PROJECT_ID="cvmaker-ai-project"
# FIREBASE_CLIENT_EMAIL="firebase-adminsdk@..."
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Signing Secrets
ENTITLEMENT_SECRET="strong_random_secret_for_tokens"
SERVER_PDF_SECRET="strong_random_secret_for_pdf_tokens"

# Email Delivery via Resend
RESEND_API_KEY="re_YourResendApiKey"
RESEND_FROM_EMAIL="resumes@biodatamaker.store"
APP_URL="https://www.biodatamaker.store"
```

---

## 🛠️ Local Development & Build

```bash
# Install dependencies
npm install

# Run local development server (Express + Vite on Port 3000)
npm run dev

# Run automated verification tests
npm run test

# Build for production
npm run build
```

---

## 📦 Deployment to Vercel with Custom Domain

1. Push repository to GitHub.
2. In Vercel, click **Import Project** and select the repository.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add the environment variables from `.env.example` in Vercel Project Settings → Environment Variables.
7. Under **Project Settings** → **Domains**, add your custom domain: `www.biodatamaker.store` and `biodatamaker.store`.
8. Configure your DNS provider with the CNAME record `cname.vercel-dns.com` for `www` and A record `76.76.21.21` for apex domain.
9. Vercel automatically deploys:
   - Client SPA from `dist/`
   - Serverless API function at `https://www.biodatamaker.store/api/server` from `api/server.js`
   - Razorpay Webhook at `https://www.biodatamaker.store/api/razorpay-webhook` from `api/razorpay-webhook.js`

---

## 🛡️ Security & Architecture

- **Strict Firestore Rules**: All Firestore reads and writes are managed server-side via Firebase Admin SDK. Client-side direct access is denied by default in `firestore.rules`.
- **HMAC Signatures**: Razorpay callbacks and webhooks are verified cryptographically using `crypto.timingSafeEqual`.
- **Zero Client-Side Secrets**: Gemini keys, Razorpay secrets, and Firebase service accounts never touch client bundles or localStorage.
- **Backward-Compatible Aliases**: Saved drafts or historical purchases with legacy IDs (`base`, `job-studio-1..8`, `marriage-1..30`) are preserved.
