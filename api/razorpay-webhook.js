/**
 * CVMaker AI - Razorpay Webhook Handler (/api/razorpay-webhook)
 * 
 * Verifies webhook signatures against raw request body.
 * Idempotently handles payment.captured and order.paid events.
 */

import { verifyWebhookSignature } from '../server/razorpay.js';
import { getFirestore } from '../server/firebaseAdmin.js';
import { sendPaidDocumentEmail } from '../server/emailDelivery.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
  }

  // Get raw body
  let rawBody = '';
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    rawBody = req.body.toString('utf-8');
  } else {
    rawBody = JSON.stringify(req.body);
  }

  const isValid = verifyWebhookSignature({ rawBody, signature });
  if (!isValid) {
    console.warn('Webhook verification failed: invalid signature.');
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = typeof req.body === 'object' && req.body !== null ? req.body : JSON.parse(rawBody);
  const eventId = event.event_id || event.id;
  const eventType = event.event;

  const db = getFirestore();

  // Idempotency check: if event already processed
  if (db && eventId) {
    try {
      const eventDoc = await db.collection('webhook_events').doc(eventId).get();
      if (eventDoc.exists) {
        console.log(`Webhook event ${eventId} already processed (idempotent).`);
        return res.status(200).json({ received: true, idempotent: true });
      }

      await db.collection('webhook_events').doc(eventId).set({
        eventType,
        receivedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Webhook idempotency check skipped:', err.message);
    }
  }

  // Process captured payment or paid order
  try {
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const orderEntity = event.payload?.order?.entity;

      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;
      const customerEmail = paymentEntity?.email;
      const templateId = paymentEntity?.notes?.templateId || orderEntity?.notes?.templateId;

      if (customerEmail && templateId && orderId) {
        // Fallback / retry email dispatch
        await sendPaidDocumentEmail({
          toEmail: customerEmail,
          templateId,
          orderId,
          paymentId
        });
      }

      if (db && orderId) {
        await db.collection('orders').doc(orderId).set({
          webhookVerified: true,
          status: 'paid',
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    }

    return res.status(200).json({ received: true, event: eventType });
  } catch (processErr) {
    console.error('Webhook processing error:', processErr.message);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
}
