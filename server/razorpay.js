import crypto from 'node:crypto';

export function getRazorpayKeyId() {
  if (!process.env.RAZORPAY_KEY_ID) throw new Error('RAZORPAY_KEY_ID is not configured.');
  return process.env.RAZORPAY_KEY_ID;
}

export async function razorpay(path, init = {}) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay server credentials are not configured.');
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    ...init,
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.description || 'Razorpay request failed.');
  return data;
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('Razorpay secret is not configured.');
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function verifyWebhookSignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured.');
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
