/**
 * CVMaker AI - Server-Side Authentication & Admin Verification
 * Verifies Firebase ID tokens and enforces custom claims (admin === true).
 */

import { getAuthAdmin } from './firebaseAdmin.js';

/**
 * Extracts Bearer token from request headers
 */
export function extractBearerToken(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || typeof authHeader !== 'string') return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Verifies Firebase ID token using Firebase Admin SDK
 */
export async function verifyUserToken(req) {
  const token = extractBearerToken(req);
  if (!token) return null;

  const authAdmin = getAuthAdmin();
  if (!authAdmin) {
    console.warn('verifyUserToken: Firebase Admin Auth not configured.');
    return null;
  }

  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    return decodedToken;
  } catch (err) {
    console.warn('verifyUserToken failed:', err.message);
    return null;
  }
}

/**
 * Checks whether user has the admin === true custom claim
 */
export async function verifyAdminUser(req) {
  const user = await verifyUserToken(req);
  if (!user) return { isAdmin: false, user: null, reason: 'unauthenticated' };

  // Strict enforcement: custom claim admin === true
  const isAdmin = user.admin === true;
  return {
    isAdmin,
    user,
    reason: isAdmin ? null : 'forbidden_not_admin'
  };
}
