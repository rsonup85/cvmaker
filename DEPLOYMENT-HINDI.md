# CV Maker AI — Complete Launch Guide (Hindi)

## 0) Sabse important: Free Firebase ka matlab kya hai?

Is final build mein Firebase Cloud Functions use nahi kiye gaye hain, kyunki Firebase Cloud Functions ke liye Blaze billing plan required hai. Firebase ko Spark/free par rakhte hue:

- Firebase Authentication = admin login
- Firebase Firestore = pricing/orders/purchases
- Vercel = website + server-side API
- Razorpay = payments
- Gemini = AI

**Important:** Vercel Hobby plan current terms ke mutabik personal/non-commercial use ke liye hai. Agar aap ₹9/₹21/₹40 charge karke commercial service launch kar rahe hain, Vercel ke eligible paid plan ka use karein. Firebase ko Spark par rakh sakte hain.

---

# 1) ZIP ko GitHub mein kaise upload karein

ZIP ko extract karein. GitHub repository ke root mein ye project files honi chahiye.

### GitHub par rakhni hain

- `src/`
- `public/`
- `api/`
- `server/`
- `scripts/`
- `index.html`
- `package.json`
- `vite.config.js`
- `tailwind.config.js`
- `postcss.config.js`
- `vercel.json`
- `firebase.json`
- `firestore.rules`
- `.firebaserc.example`
- `.env.example`
- `README.md`
- `ADMIN_SETUP.md`
- `DEPLOYMENT-HINDI.md`

### GitHub par NEVER rakhni hain

- `.env`
- Firebase service-account JSON
- Razorpay secret
- Gemini API key
- Firebase Admin private key
- Vercel token
- `node_modules/`
- `dist/`

`.gitignore` already sensitive files ko ignore karta hai.

---

# 2) Firebase account/project banayein

1. Firebase Console open karein.
2. Google account se login karein.
3. **Create a project** click karein.
4. Project name example: `cv-maker-ai-prod`
5. Google Analytics optional hai; beginner ke liye off rakh sakte hain.
6. Project create hone dein.

Firebase project ko **Spark plan** par rehne dein.

---

# 3) Firebase Web App add karein

Firebase Console → Project Overview → Web icon `</>`.

App nickname:

`CV Maker AI Web`

Firebase Hosting ko abhi enable karna zaroori nahi hai; website Vercel par chalegi.

Register app ke baad Firebase ye config dega:

- apiKey
- authDomain
- projectId
- storageBucket
- messagingSenderId
- appId

In values ko copy karke baad mein Vercel Environment Variables mein daalna hai.

---

# 4) Firebase Authentication enable karein

Firebase Console → **Authentication** → **Get started**.

Sign-in providers → **Email/Password** → Enable.

Phone authentication ki zarurat nahi hai.

---

# 5) Admin user banayein

Authentication → Users → **Add user**.

Example:

Email:
`your-admin-email@example.com`

Password:
strong unique password

Is password ko GitHub mein kabhi mat likhna.

Abhi user normal Firebase user hai. Usko admin banane ke liye custom claim set karna hoga.

---

# 6) Firestore create karein

Firebase Console → **Firestore Database** → Create database.

Production mode select karein.

Region choose karte waqt India ke liye nearest supported region choose karein. Ek baar database region choose karne ke baad change karna difficult hota hai.

Browser ko direct Firestore access nahi diya gaya hai. Included `firestore.rules` sab browser reads/writes ko deny karta hai.

---

# 7) Firebase CLI install karein

Apne computer par Node.js 24.x install karein.

Terminal:

`node -v`

24.x aana chahiye.

Firebase CLI:

`npm install -g firebase-tools`

Check:

`firebase --version`

Login:

`firebase login`

---

# 8) Project ko Firebase project se link karein

Project folder mein terminal kholein.

`.firebaserc.example` ko copy karke `.firebaserc` banayein.

Windows:

`copy .firebaserc.example .firebaserc`

Mac/Linux:

`cp .firebaserc.example .firebaserc`

`.firebaserc` mein:

`YOUR_FIREBASE_PROJECT_ID`

ko actual Firebase Project ID se replace karein.

Project ID Firebase Console → Project settings → General mein milega.

`.firebaserc` ko GitHub par commit na karein agar aap organization/project IDs ko private rakhna chahte hain; repository mein `.firebaserc.example` enough hai.

---

# 9) Firestore rules deploy karein

Project folder mein:

`firebase deploy --only firestore:rules`

Successful output ke baad browser direct Firestore write nahi kar sakta.

---

# 10) Firebase Service Account banayein

Firebase Console → Project settings → Service accounts.

Firebase Admin SDK section mein **Generate new private key**.

JSON download hoga.

### WARNING

Ye JSON bahut sensitive hai.

- GitHub par upload mat karein.
- Chat mein paste mat karein.
- Website source mein mat rakhein.
- Vercel public variables mein mat rakhein.

Is JSON se humein sirf 3 server values chahiye:

- `project_id`
- `client_email`
- `private_key`

---

# 11) Admin claim set karein

Project folder mein dependencies install karein:

`npm install`

Agar service account JSON ka path hai:

Mac/Linux:

`export GOOGLE_APPLICATION_CREDENTIALS="/full/path/service-account.json"`

Windows PowerShell:

`$env:GOOGLE_APPLICATION_CREDENTIALS="C:\\full\\path\\service-account.json"`

Phir:

`npm run admin:claim -- your-admin-email@example.com`

Success message aayega ki admin claim set ho gaya.

Ab Firebase Authentication se logout/login karein. Isse new ID token mein `admin=true` aa jayega.

---

# 12) Razorpay setup

Razorpay Dashboard open karein.

Pehle **Test Mode** mein test karein.

API Keys se:

- Key ID
- Key Secret

milenge.

Production launch ke waqt Test keys ki jagah Live keys use karein.

### Vercel mein ye server-only rahenge

`RAZORPAY_KEY_ID`

`RAZORPAY_KEY_SECRET`

Browser mein sirf order response se Razorpay Key ID milti hai; secret kabhi browser ko nahi milta.

---

# 13) Razorpay webhook

Vercel deploy hone ke baad aapko URL milega, example:

`https://your-project.vercel.app`

Razorpay webhook URL:

`https://your-project.vercel.app/api/razorpay-webhook`

Razorpay webhook secret khud generate karein, example long random string.

Vercel variable:

`RAZORPAY_WEBHOOK_SECRET`

Razorpay events:

- `payment.captured`
- `order.paid`

Webhook signature server par verify hoti hai aur duplicate webhook events ko Firestore mein idempotently track kiya jata hai.

---

# 14) Gemini API setup

Google AI Studio/Gemini API se API key create karein.

Vercel mein sirf:

`GEMINI_API_KEY`

set karein.

**Important:**

`VITE_GEMINI_API_KEY` kabhi mat banayein.

AI call Vercel server se hoti hai.

---

# 15) Vercel project banayein

Vercel dashboard → Add New → Project.

GitHub connect karein.

Apni CV Maker repository select karein.

Framework: Vite detect hona chahiye.

Build command:

`npm run build`

Output directory:

`dist`

Node.js version:

`24.x`

Repository push hote hi Vercel automatic deploy karega.

---

# 16) Vercel Environment Variables

Vercel → Project → Settings → Environment Variables.

### PUBLIC variables

Ye browser mein ja sakti hain:

`VITE_FIREBASE_API_KEY`

`VITE_FIREBASE_AUTH_DOMAIN`

`VITE_FIREBASE_PROJECT_ID`

`VITE_FIREBASE_STORAGE_BUCKET`

`VITE_FIREBASE_MESSAGING_SENDER_ID`

`VITE_FIREBASE_APP_ID`

`VITE_SITE_URL`

`VITE_SITE_URL` example:

`https://www.yourdomain.com`

### SERVER-ONLY variables

Ye sirf Vercel server functions ke liye hain:

`FIREBASE_PROJECT_ID`

`FIREBASE_CLIENT_EMAIL`

`FIREBASE_PRIVATE_KEY`

`RAZORPAY_KEY_ID`

`RAZORPAY_KEY_SECRET`

`RAZORPAY_WEBHOOK_SECRET`

`GEMINI_API_KEY`

`GEMINI_MODEL`

`ENTITLEMENT_SECRET`

`ENTITLEMENT_SECRET` ke liye 32+ random characters use karein.

Example generate karne ke liye local terminal:

`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### FIREBASE_PRIVATE_KEY

Service account JSON ki `private_key` value copy karein.

Usmein `\\n` line breaks ho sakte hain. Vercel environment variable mein actual multiline private key paste karein. Code escaped `\\n` ko actual newline mein convert karta hai.

---

# 17) Vercel redeploy

Environment variables save karne ke baad deployment redeploy karein.

Vercel → Deployments → latest deployment → Redeploy.

Ya GitHub par small commit push karein.

---

# 18) Vercel API test

Deploy ke baad browser mein website open karein.

Developer tools/network mein `/api/server` requests dekh sakte hain.

Pricing request successful honi chahiye.

Agar Firebase credentials missing hain to server error aayega; Vercel Function logs mein exact reason milega.

---

# 19) Admin login test

Website mein hidden Admin panel open karein.

Firebase admin email/password se login karein.

Agar `Admin verified` dikhe:

- Basic price change
- Professional price change
- Custom clone price change
- Per-template override

save karke dekhein.

Pricing Firestore ke `config/pricing` document mein server ke through save hogi.

---

# 20) Payment test

Razorpay Test Mode use karein.

1. Basic/Professional paid template select karein.
2. Download click karein.
3. Server order create karega.
4. Razorpay checkout open hoga.
5. Test payment complete karein.
6. `/api/server` payment verification karega.
7. Amount/order/payment status Razorpay se verify hoga.
8. Purchase Firestore mein save hogi.
9. PDF download hoga.

Client ko amount decide karne ki permission nahi hai.

---

# 21) Custom AI clone test

1. Template image select karein.
2. Maximum 3 MB JPG/PNG/WebP.
3. Custom Razorpay payment complete karein.
4. Server payment verify karega.
5. Short-lived entitlement token issue hoga.
6. Image Vercel server API ko bheji jayegi.
7. Gemini API key server-only use hogi.
8. AI result sanitize hoga.
9. Browser ko layout config milega.

3 MB limit intentionally rakhi gayi hai because serverless request payload limits ko safely respect karna hai.

---

# 22) Custom domain

Vercel → Project → Settings → Domains.

Apna domain add karein.

DNS records Vercel ke instructions ke according set karein.

Phir Vercel environment variable:

`VITE_SITE_URL=https://yourdomain.com`

update karein aur redeploy karein.

---

# 23) Final production checklist

- [ ] Firebase project created
- [ ] Firebase Spark plan confirmed
- [ ] Firebase Web App created
- [ ] Email/Password Auth enabled
- [ ] Admin user created
- [ ] Firestore created
- [ ] Firestore rules deployed
- [ ] Admin custom claim added
- [ ] GitHub repository clean
- [ ] No `.env` in GitHub
- [ ] No service account JSON in GitHub
- [ ] Vercel project connected to GitHub
- [ ] Vercel Node 24 selected
- [ ] All Vercel environment variables set
- [ ] Vercel production deployment successful
- [ ] Razorpay Test payment successful
- [ ] Razorpay webhook successful
- [ ] Gemini test successful
- [ ] Admin pricing save successful
- [ ] Free template download successful
- [ ] Paid template download successful
- [ ] Custom clone successful
- [ ] Custom domain connected
- [ ] `VITE_SITE_URL` updated
- [ ] Razorpay Live keys added only at final launch
- [ ] Razorpay Live webhook configured

---

# 24) Kaunsi file kahan rahegi?

## GitHub

Pura source code GitHub par rahega:

`src/`, `api/`, `server/`, `public/`, `scripts/`, config files, package files, documentation.

## Vercel

GitHub repository ko Vercel automatically build/deploy karega.

Vercel par:

- frontend
- `/api/server`
- `/api/razorpay-webhook`

run honge.

## Firebase

Firebase Console mein:

- Authentication users
- Firestore database
- Firestore rules

rahenge.

Firebase service account JSON ko Firebase/Vercel source file ke roop mein upload nahi karna hai. Uski required values Vercel server environment variables mein rakhi jayengi.

## Razorpay

Razorpay Dashboard mein:

- API keys
- webhook
- payment records

rahenge.

## Gemini

Gemini API key Vercel server environment variable mein rahegi.

---

# 25) Architecture summary

`GitHub → Vercel → /api/server → Firebase Admin + Firestore`

`Browser → Firebase Auth`

`Vercel → Razorpay`

`Vercel → Gemini`

`Razorpay → /api/razorpay-webhook → Firestore`

Browser ko kabhi Razorpay secret, Gemini key, Firebase Admin private key ya Firestore write permission nahi milti.
