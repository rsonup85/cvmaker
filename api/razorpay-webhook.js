import crypto from 'node:crypto';

import { db, FieldValue } from '../server/firebaseAdmin.js';
import { verifyWebhookSignature, razorpay } from '../server/razorpay.js';
import { deliverPaidResumeEmail } from '../server/emailDelivery.js';

export const config = { maxDuration: 60, api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  try {
    const rawBody = await readRawBody(req);
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const eventId = String(req.headers['x-razorpay-event-id'] || '');
    if (!signature || !rawBody.length) return res.status(400).send('Bad request');
    if (!verifyWebhookSignature(rawBody, signature)) return res.status(401).send('Invalid signature');
    const event = JSON.parse(rawBody.toString('utf8'));
    const id = eventId || crypto.createHash('sha256').update(rawBody).digest('hex');
    const eventRef = db().collection('webhookEvents').doc(id);
    const existing = await eventRef.get();
    if (existing.exists && existing.data()?.processed === true) return res.status(200).json({ received: true, duplicate: true });

    if (['payment.captured', 'order.paid'].includes(event.event)) {
      const payment = event.payload?.payment?.entity;
      const order = event.payload?.order?.entity;
      const orderId = payment?.order_id || order?.id;
      if (orderId) {
        const orderRef = db().collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();
        if (orderSnap.exists) {
          const stored = orderSnap.data();
          let paymentEntity = payment;
          if (!paymentEntity?.id && order?.id) {
            const payments = await razorpay(`orders/${encodeURIComponent(order.id)}/payments`);
            paymentEntity = payments?.items?.find((p) => p.status === 'captured') || payments?.items?.[0];
          }
          const paymentId = paymentEntity?.id || stored.paymentId;
          if (paymentId && paymentEntity?.amount === stored.amountPaise && paymentEntity?.currency === stored.currency && paymentEntity?.status === 'captured') {
            await orderRef.set({ status: 'paid', paymentId, webhookEvent: event.event, webhookReceivedAt: FieldValue.serverTimestamp() }, { merge: true });
            await db().collection('purchases').doc(paymentId).set({
              purchaseId: paymentId, orderId, paymentId, uid: stored.uid || null,
              templateId: stored.templateId, templateName: stored.templateName, category: stored.category, product: stored.product,
              amountPaise: stored.amountPaise, currency: stored.currency, status: 'paid',
              customerEmail: stored.customerEmail || null, customerName: stored.customerName || null,
              webhookEvent: event.event, webhookReceivedAt: FieldValue.serverTimestamp(),
            }, { merge: true });

            // ============================================================
            // FIX: Webhook must NOT block on Chromium PDF generation.
            // Fire-and-forget so Razorpay gets a fast 200 and doesn't
            // retry unnecessarily. Email idempotency is handled by
            // claimEmailDelivery() in serverPdf.js.
            // ============================================================
            if (stored.product === 'template') {
              deliverPaidResumeEmail(paymentId).catch((emailError) => {
                console.error('Webhook background PDF email delivery pending:', emailError);
              });
            }
          }
        }
      }
    }
    await eventRef.set({ event: event.event, processed: true, receivedAt: FieldValue.serverTimestamp() }, { merge: true });
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Webhook processing failed');
  }
}