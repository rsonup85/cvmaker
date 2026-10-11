import { auth } from './firebase';

async function callServer(action, payload = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  let response;
  try {
    response = await fetch('/api/server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch (e) {
    throw new Error(e?.message || 'Network error — server tak request nahi gayi.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Server error (${response.status})`);
  }
  return data;
}

export const getAdminStatus = () => callServer('getAdminStatus');
export const getPricing = () => callServer('getPricing');
export const createRazorpayOrder = (payload) => callServer('createRazorpayOrder', payload);
export const verifyRazorpayPayment = (payload) => callServer('verifyRazorpayPayment', payload);
export const getServerPdfData = (payload) => callServer('getServerPdfData', payload);
export const cloneCustomTemplate = (payload) => callServer('cloneCustomTemplate', payload);
export const aiEnhance = (payload) => callServer('aiEnhance', payload);
export const savePricing = (payload) => callServer('savePricing', payload);
export const resetPricing = () => callServer('resetPricing');

export const getLaunchConfig = () => callServer("getLaunchConfig");
export const saveLaunchConfig = (payload) => callServer("saveLaunchConfig", payload);
