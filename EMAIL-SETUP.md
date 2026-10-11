# Email Delivery Setup via Resend

**Official Production Domain:** `https://www.biodatamaker.store`  
**Official Email Sender:** `resumes@biodatamaker.store` (or your verified domain sender)

---

## 1. Overview
When customers purchase a paid High-Resolution Resume or Marriage Biodata, the system automatically triggers a server-rendered delivery email containing order details, receipt numbers, and a direct download link.

Email generation is handled by:
- `server/emailDelivery.js`
- Serverless fallback via `api/razorpay-webhook.js`

---

## 2. Environment Variables

Configure these in your Vercel Project Settings (Environment Variables):

```env
# Resend API Key from resend.com
RESEND_API_KEY="re_YourApiKeyHere"

# Verified Sender Email on your domain
RESEND_FROM_EMAIL="resumes@biodatamaker.store"

# Production Application URL (DO NOT use Vercel default domain)
APP_URL="https://www.biodatamaker.store"
```

---

## 3. Resend Domain Verification

1. Go to **Resend Dashboard** → **Domains** → **Add Domain**.
2. Enter your custom domain: `biodatamaker.store`.
3. Add the provided DNS records (DKIM, SPF, and MX) to your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.).
4. Once verified, emails will be delivered directly from `resumes@biodatamaker.store` with 100% inbox deliverability.
5. In development/testing before domain DNS verification, you can optionally send to your own registered Resend test email.

---

## 4. Download Link Construction

The download links dispatched in emails follow the canonical production structure:
`https://www.biodatamaker.store/download?order={orderId}`

This ensures users never receive broken or outdated deployment URLs.
