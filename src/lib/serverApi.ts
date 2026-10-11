/**
 * CVMaker AI - Server API Client Wrapper
 * 
 * Preserves the exact request/response contract:
 * - Same-origin POST to /api/server with { action, ...payload }
 * - Authorization: Bearer <firebaseIdToken> when user is logged in
 * - Exact response shapes for all existing actions
 */

import { getCurrentIdToken } from './firebase';

const API_BASE = '/api/server';

export interface ApiResponse<T = any> {
  success?: boolean;
  ok?: boolean;
  error?: string;
  [key: string]: any;
}

/**
 * Universal multiplexer call to /api/server
 */
export async function callServerApi<T = any>(
  action: string,
  payload: Record<string, any> = {}
): Promise<T> {
  const token = await getCurrentIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...payload })
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    throw new Error(`Server returned non-JSON response (${response.status}): ${text.slice(0, 100)}`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `API request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Health check: GET /api/server
 */
export async function getServerHealth(): Promise<{ ok: boolean; service: string; version?: string }> {
  const res = await fetch(API_BASE, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Server health check failed: ${res.status}`);
  }
  return await res.json();
}

/**
 * Action: getAdminStatus
 * Returns { success: true, admin: boolean, user?: object }
 */
export async function getAdminStatus(): Promise<{ success: boolean; admin: boolean; user?: any }> {
  return await callServerApi('getAdminStatus');
}

/**
 * Action: getPricing
 * Returns { success: true, basic: number, professional: number, customClone: number, templates: Record<string, number>, grandLaunchEnabled: boolean }
 */
export async function getPricing(): Promise<{
  success: boolean;
  basic: number;
  professional: number;
  customClone: number;
  templates: Record<string, number>;
  grandLaunchEnabled: boolean;
}> {
  return await callServerApi('getPricing');
}

/**
 * Action: createRazorpayOrder
 * Creates Razorpay order for paid templates or returns { free: true } for free templates
 */
export async function createRazorpayOrder(params: {
  templateId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  snapshot?: any;
}): Promise<{
  success: boolean;
  free?: boolean;
  orderId?: string;
  keyId?: string;
  amount?: number;
  currency?: string;
  templateId?: string;
  templateName?: string;
  product?: string;
}> {
  return await callServerApi('createRazorpayOrder', params);
}

/**
 * Action: verifyRazorpayPayment
 * Server verifies Razorpay signature and captures payment
 */
export async function verifyRazorpayPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  templateId: string;
  customerEmail: string;
  snapshot?: any;
}): Promise<{
  success: boolean;
  verified: boolean;
  orderId: string;
  paymentId: string;
  templateId: string;
  entitlementToken?: string;
  emailDelivery?: {
    attempted: boolean;
    sent: boolean;
    message?: string;
  };
}> {
  return await callServerApi('verifyRazorpayPayment', params);
}

/**
 * Action: getServerPdfData
 * Validates HMAC token and retrieves server-side resume snapshot
 */
export async function getServerPdfData(params: {
  orderId: string;
  token: string;
}): Promise<{
  success: boolean;
  snapshot: any;
  templateId: string;
  customerEmail?: string;
}> {
  return await callServerApi('getServerPdfData', params);
}

/**
 * Action: cloneCustomTemplate
 * Analyzes uploaded template image and generates layout config
 */
export async function cloneCustomTemplate(params: {
  imageBase64: string;
  mimeType: string;
  entitlementToken?: string;
}): Promise<{
  success: boolean;
  layoutConfig: any;
}> {
  return await callServerApi('cloneCustomTemplate', params);
}

/**
 * Action: aiEnhance
 * Dispatches to Gemini server-side integration
 */
export async function aiEnhance(params: {
  type: string;
  text?: string;
  targetRole?: string;
  jobDescription?: string;
  resumeData?: any;
  biodataData?: any;
  language?: string;
  fileBase64?: string;
  fileMimeType?: string;
}): Promise<{
  success: boolean;
  type: string;
  enhancedText?: string;
  [key: string]: any;
}> {
  return await callServerApi('aiEnhance', params);
}

/**
 * Action: savePricing (Admin only)
 */
export async function savePricing(pricing: {
  basic: number;
  professional: number;
  customClone: number;
  templates?: Record<string, number>;
}): Promise<{ success: boolean }> {
  return await callServerApi('savePricing', { pricing });
}

/**
 * Action: resetPricing (Admin only)
 */
export async function resetPricing(): Promise<{ success: boolean }> {
  return await callServerApi('resetPricing');
}

/**
 * Action: getLaunchConfig
 */
export async function getLaunchConfig(): Promise<{
  success: boolean;
  grandLaunchEnabled: boolean;
}> {
  return await callServerApi('getLaunchConfig');
}

/**
 * Action: saveLaunchConfig (Admin only)
 */
export async function saveLaunchConfig(config: {
  grandLaunchEnabled: boolean;
}): Promise<{ success: boolean }> {
  return await callServerApi('saveLaunchConfig', { config });
}
