/**
 * CVMaker AI - Main Serverless API Entry Point (/api/server)
 * 
 * Multiplexes all server actions with Firebase Admin authentication,
 * Razorpay orders & verification, Gemini AI operations, and pricing management.
 */

import { verifyUserToken, verifyAdminUser } from '../server/auth.js';
import { resolveServerPrice, DEFAULT_PRICING, getTemplateById } from '../server/catalog.js';
import { 
  createRazorpayServerOrder, 
  verifyPaymentSignature, 
  generateEntitlementToken, 
  getRazorpayKeys 
} from '../server/razorpay.js';
import { generateGeminiContent } from '../server/gemini.js';
import { getFirestore } from '../server/firebaseAdmin.js';
import { sendPaidDocumentEmail } from '../server/emailDelivery.js';
import { sanitizeResumeSnapshot, signPdfToken, verifyPdfToken } from '../server/serverPdf.js';

// In-memory runtime pricing fallback (synced with Firestore if credentials exist)
let runtimePricing = { ...DEFAULT_PRICING };

async function fetchFirestorePricing() {
  const db = getFirestore();
  if (!db) return runtimePricing;
  try {
    const doc = await db.collection('settings').doc('pricing').get();
    if (doc.exists) {
      runtimePricing = { ...runtimePricing, ...doc.data() };
    }
  } catch (err) {
    console.warn('Firestore pricing fetch warning:', err.message);
  }
  return runtimePricing;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check: GET /api/server
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'cvmaker-server',
      version: '2.0.0',
      activeTemplatesCount: 400,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const body = req.body || {};
  const { action } = body;

  if (!action || typeof action !== 'string') {
    return res.status(400).json({ error: 'Missing required "action" field in request body.' });
  }

  try {
    switch (action) {
      // -----------------------------------------------------------------
      // ACTION: getAdminStatus
      // -----------------------------------------------------------------
      case 'getAdminStatus': {
        const { isAdmin, user } = await verifyAdminUser(req);
        return res.status(200).json({
          success: true,
          admin: isAdmin,
          user: user ? { uid: user.uid, email: user.email } : null
        });
      }

      // -----------------------------------------------------------------
      // ACTION: getPricing
      // -----------------------------------------------------------------
      case 'getPricing': {
        const pricing = await fetchFirestorePricing();
        return res.status(200).json({
          success: true,
          basic: pricing.basic,
          professional: pricing.professional,
          customClone: pricing.customClone,
          templates: pricing.templates || {},
          grandLaunchEnabled: Boolean(pricing.grandLaunchEnabled)
        });
      }

      // -----------------------------------------------------------------
      // ACTION: createRazorpayOrder
      // -----------------------------------------------------------------
      case 'createRazorpayOrder': {
        const { templateId, customerEmail, customerName, snapshot } = body;
        if (!templateId) {
          return res.status(400).json({ error: 'Missing templateId' });
        }

        const pricing = await fetchFirestorePricing();
        const priceInfo = resolveServerPrice(templateId, pricing);

        // Free template response
        if (priceInfo.isFree) {
          return res.status(200).json({
            success: true,
            free: true,
            templateId: priceInfo.template.id,
            templateName: priceInfo.template.name,
            amount: 0,
            currency: 'INR'
          });
        }

        // Paid template: create order via Razorpay
        const { keyId } = getRazorpayKeys();
        const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        
        const rzpOrder = await createRazorpayServerOrder({
          amountInPaise: priceInfo.amountInPaise,
          currency: priceInfo.currency,
          receipt,
          notes: {
            templateId: priceInfo.template.id,
            customerEmail: customerEmail || '',
            customerName: customerName || ''
          }
        });

        // Store snapshot if Firestore is configured
        const db = getFirestore();
        if (db && snapshot) {
          try {
            await db.collection('orders').doc(rzpOrder.id).set({
              orderId: rzpOrder.id,
              templateId: priceInfo.template.id,
              templateName: priceInfo.template.name,
              amount: priceInfo.amountInRupees,
              currency: priceInfo.currency,
              customerEmail: customerEmail || '',
              customerName: customerName || '',
              status: 'created',
              createdAt: new Date().toISOString(),
              snapshot: sanitizeResumeSnapshot(snapshot)
            });
          } catch (dbErr) {
            console.warn('Order storage in Firestore skipped:', dbErr.message);
          }
        }

        return res.status(200).json({
          success: true,
          free: false,
          orderId: rzpOrder.id,
          keyId: keyId,
          amount: priceInfo.amountInPaise,
          currency: priceInfo.currency,
          templateId: priceInfo.template.id,
          templateName: priceInfo.template.name,
          product: priceInfo.tier
        });
      }

      // -----------------------------------------------------------------
      // ACTION: verifyRazorpayPayment
      // -----------------------------------------------------------------
      case 'verifyRazorpayPayment': {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, templateId, customerEmail, snapshot } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return res.status(400).json({ error: 'Missing Razorpay signature verification parameters.' });
        }

        const isValid = verifyPaymentSignature({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature
        });

        if (!isValid) {
          return res.status(400).json({ success: false, verified: false, error: 'Invalid payment signature.' });
        }

        const entitlementToken = generateEntitlementToken({
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          templateId,
          customerEmail
        });

        // Dispatch Email Delivery
        let emailDelivery = { attempted: false, sent: false };
        if (customerEmail) {
          emailDelivery = await sendPaidDocumentEmail({
            toEmail: customerEmail,
            templateId,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id
          });
        }

        // Update order record in Firestore if configured
        const db = getFirestore();
        if (db) {
          try {
            await db.collection('orders').doc(razorpay_order_id).set({
              status: 'paid',
              paymentId: razorpay_payment_id,
              paidAt: new Date().toISOString(),
              customerEmail: customerEmail || '',
              templateId,
              entitlementToken,
              emailDelivery
            }, { merge: true });
          } catch (dbErr) {
            console.warn('Firestore order status update warning:', dbErr.message);
          }
        }

        return res.status(200).json({
          success: true,
          verified: true,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          templateId,
          entitlementToken,
          emailDelivery
        });
      }

      // -----------------------------------------------------------------
      // ACTION: getServerPdfData
      // -----------------------------------------------------------------
      case 'getServerPdfData': {
        const { orderId, token } = body;
        const verified = verifyPdfToken(token);
        if (!verified || verified.orderId !== orderId) {
          return res.status(403).json({ error: 'Invalid or expired PDF token.' });
        }

        const db = getFirestore();
        let snapshot = null;
        if (db) {
          const doc = await db.collection('orders').doc(orderId).get();
          if (doc.exists) {
            snapshot = doc.data()?.snapshot;
          }
        }

        return res.status(200).json({
          success: true,
          snapshot,
          templateId: verified.templateId
        });
      }

      // -----------------------------------------------------------------
      // ACTION: cloneCustomTemplate
      // -----------------------------------------------------------------
      case 'cloneCustomTemplate': {
        const { imageBase64, mimeType } = body;
        if (!imageBase64) {
          return res.status(400).json({ error: 'Missing imageBase64 data for clone.' });
        }

        const aiResult = await generateGeminiContent({
          type: 'designSuggest',
          fileBase64: imageBase64,
          fileMimeType: mimeType || 'image/jpeg',
          targetRole: 'Executive'
        });

        return res.status(200).json({
          success: true,
          layoutConfig: aiResult
        });
      }

      // -----------------------------------------------------------------
      // ACTION: aiEnhance
      // -----------------------------------------------------------------
      case 'aiEnhance': {
        const aiResponse = await generateGeminiContent(body);
        return res.status(200).json(aiResponse);
      }

      // -----------------------------------------------------------------
      // ACTION: savePricing (Admin only)
      // -----------------------------------------------------------------
      case 'savePricing': {
        const { isAdmin } = await verifyAdminUser(req);
        if (!isAdmin) {
          return res.status(403).json({ error: 'Admin permission required (custom claim admin === true).' });
        }

        const newPricing = body.pricing || {};
        runtimePricing = { ...runtimePricing, ...newPricing };

        const db = getFirestore();
        if (db) {
          await db.collection('settings').doc('pricing').set(runtimePricing, { merge: true });
        }

        return res.status(200).json({ success: true, pricing: runtimePricing });
      }

      // -----------------------------------------------------------------
      // ACTION: resetPricing (Admin only)
      // -----------------------------------------------------------------
      case 'resetPricing': {
        const { isAdmin } = await verifyAdminUser(req);
        if (!isAdmin) {
          return res.status(403).json({ error: 'Admin permission required.' });
        }

        runtimePricing = { ...DEFAULT_PRICING };
        const db = getFirestore();
        if (db) {
          await db.collection('settings').doc('pricing').set(DEFAULT_PRICING);
        }

        return res.status(200).json({ success: true, pricing: runtimePricing });
      }

      // -----------------------------------------------------------------
      // ACTION: getLaunchConfig
      // -----------------------------------------------------------------
      case 'getLaunchConfig': {
        const pricing = await fetchFirestorePricing();
        return res.status(200).json({
          success: true,
          grandLaunchEnabled: Boolean(pricing.grandLaunchEnabled)
        });
      }

      // -----------------------------------------------------------------
      // ACTION: saveLaunchConfig (Admin only)
      // -----------------------------------------------------------------
      case 'saveLaunchConfig': {
        const { isAdmin } = await verifyAdminUser(req);
        if (!isAdmin) {
          return res.status(403).json({ error: 'Admin permission required.' });
        }

        const grandLaunchEnabled = Boolean(body.config?.grandLaunchEnabled);
        runtimePricing.grandLaunchEnabled = grandLaunchEnabled;

        const db = getFirestore();
        if (db) {
          await db.collection('settings').doc('pricing').set({ grandLaunchEnabled }, { merge: true });
        }

        return res.status(200).json({ success: true, grandLaunchEnabled });
      }

      default:
        return res.status(400).json({ error: `Unknown action: "${action}"` });
    }
  } catch (error) {
    console.error(`API action "${action}" error:`, error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error occurred.'
    });
  }
}
