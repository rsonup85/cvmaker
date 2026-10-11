/**
 * CVMaker AI - Razorpay Payment & Security Module
 * 
 * Enforces server-authoritative pricing and cryptographic HMAC verification.
 * Client-submitted payment status is never trusted.
 */

import crypto from 'crypto';

export function getRazorpayKeys() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || ''
  };
}

/**
 * Creates an order directly via Razorpay REST API
 */
export async function createRazorpayServerOrder({ amountInPaise, currency = 'INR', receipt, notes = {} }) {
  const { keyId, keySecret } = getRazorpayKeys();
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) not configured on server.');
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.description || `Razorpay order creation failed (${response.status})`);
  }

  return data;
}

/**
 * Verifies Razorpay HMAC signature on client callback:
 * generated_signature = hmac_sha256(order_id + "|" + payment_id, secret)
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const { keySecret } = getRazorpayKeys();
  if (!keySecret) return false;

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf-8'),
    Buffer.from(signature, 'utf-8')
  );
}

/**
 * Verifies Razorpay Webhook signature:
 * generated_signature = hmac_sha256(rawBody, webhookSecret)
 */
export function verifyWebhookSignature({ rawBody, signature }) {
  const { webhookSecret } = getRazorpayKeys();
  if (!webhookSecret || !signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf-8'),
    Buffer.from(signature, 'utf-8')
  );
}

/**
 * Generates an HMAC signed entitlement token for paid purchases
 */
export function generateEntitlementToken({ orderId, paymentId, templateId, customerEmail }) {
  const secret = process.env.ENTITLEMENT_SECRET || 'cvmaker_entitlement_secret_key_2026';
  const payload = `${orderId}:${paymentId}:${templateId}:${customerEmail || ''}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
}

/**
 * Verifies an entitlement token
 */
export function verifyEntitlementToken(token) {
  try {
    const secret = process.env.ENTITLEMENT_SECRET || 'cvmaker_entitlement_secret_key_2026';
    const parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const expectedSignature = crypto.createHmac('sha256', secret).update(parsed.payload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(parsed.signature))) {
      return null;
    }

    const [orderId, paymentId, templateId, customerEmail] = parsed.payload.split(':');
    return { orderId, paymentId, templateId, customerEmail };
  } catch {
    return null;
  }
}
