# CVMaker — Server-Side Paid PDF Email Delivery

This version changes the paid email flow so the **email is triggered by the server after Razorpay confirms/captures the payment**. The browser is no longer responsible for uploading the PDF or calling an email endpoint.

## New reliable flow

1. User fills the resume email once.
2. User clicks **Pay & Download**.
3. CVMaker saves a compact resume snapshot with the Razorpay order.
4. Razorpay payment is captured and verified.
5. CVMaker server marks the purchase as paid.
6. The server generates the clean PDF from the saved resume snapshot using headless Chromium.
7. The server sends that PDF as an attachment through Resend.
8. Razorpay webhook also performs the same server-side delivery as a retry path if the browser closes or the frontend verification request is interrupted.
9. The user still gets the normal browser download after payment verification.

### Important reliability change

The browser does **not** send `pdfBase64` to the email API anymore. The old `sendResumeEmail` action has been removed from the public API.

## Vercel Environment Variables

Add these to Production:

```text
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=CVMaker <noreply@your-verified-domain.com>
APP_URL=https://cvmaker-azure.vercel.app
ENTITLEMENT_SECRET=your-long-random-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
```

The existing Firebase and Razorpay server variables remain required.

## Razorpay webhook

In Razorpay, configure the webhook endpoint:

```text
https://cvmaker-azure.vercel.app/api/razorpay-webhook
```

Enable payment events used by the project, including:

- `payment.captured`
- `order.paid`

Set the same value in `RAZORPAY_WEBHOOK_SECRET`.

## Resend sender

Use a sender/domain that Resend allows for the account. For production, a verified domain sender is recommended, for example:

```text
CVMaker <noreply@yourdomain.com>
```

Resend supports PDF attachments through its email API. See the official documentation before launch.

## Vercel runtime note

Server-side Chromium adds more work than the old browser-only PDF flow. The API files request a 60-second function duration, but the actual limit depends on your Vercel plan. Vercel documents that Puppeteer can run in serverless functions, and Sparticuz provides Chromium specifically for serverless environments.

If a deployment is on a plan with a shorter function timeout, webhook retries are still useful, but a longer serverless execution limit may be needed for consistently fast PDF generation.

## Security

- The server calculates/validates the product price; the browser cannot choose a cheaper price.
- Resume data is saved against the Razorpay order before payment.
- PDF/email delivery requires a server-verified paid purchase.
- Server PDF access uses a short-lived signed token.
- Email sending is claimed with a Firestore lock so duplicate webhook/frontend calls do not normally send duplicate emails.
- `RESEND_API_KEY` must stay in Vercel Environment Variables, never in GitHub.
