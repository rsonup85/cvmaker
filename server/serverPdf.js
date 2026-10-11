/**
 * CVMaker AI - Server PDF Token & Snapshot Management
 */

import crypto from 'crypto';

/**
 * Sanitizes resume snapshot to stay under Firestore size caps
 * Intentionally excludes heavy photo base64 data.
 */
export function sanitizeResumeSnapshot(data) {
  if (!data || typeof data !== 'object') return {};

  const clone = JSON.parse(JSON.stringify(data));

  // Strip large photo base64 strings if present
  if (clone.personal && clone.personal.photo) {
    clone.personal.photo = '[photo_omitted_for_storage]';
  }

  return clone;
}

/**
 * Signs a short-lived token for retrieving server PDF data
 */
export function signPdfToken(orderId, templateId) {
  const secret = process.env.SERVER_PDF_SECRET || process.env.ENTITLEMENT_SECRET || 'cvmaker_pdf_token_secret';
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
  const payload = `${orderId}:${templateId}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

/**
 * Verifies a server PDF token
 */
export function verifyPdfToken(token) {
  try {
    const secret = process.env.SERVER_PDF_SECRET || process.env.ENTITLEMENT_SECRET || 'cvmaker_pdf_token_secret';
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [orderId, templateId, expiresAtStr, sig] = decoded.split(':');

    if (!orderId || !templateId || !expiresAtStr || !sig) return null;

    if (Date.now() > Number(expiresAtStr)) {
      return null; // Expired
    }

    const payload = `${orderId}:${templateId}:${expiresAtStr}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
      return null;
    }

    return { orderId, templateId };
  } catch {
    return null;
  }
}
