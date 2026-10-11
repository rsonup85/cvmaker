import { adminAuth } from './firebaseAdmin.js';

export async function getUserFromRequest(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    return await adminAuth().verifyIdToken(header.slice(7), true);
  } catch {
    return null;
  }
}

export async function requireUser(req, res) {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }
  return user;
}

export async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.admin !== true) {
    res.status(403).json({ error: 'Admin access required.' });
    return null;
  }
  return user;
}
