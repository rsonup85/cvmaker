/**
 * Pricing client cache.
 *
 * IMPORTANT: this cache is display-only. The server is the only authority for
 * prices, free/paid state, and Razorpay order amounts.
 */

export const DEFAULT_PRICES = Object.freeze({
  basic: 9,
  professional: 21,
  customClone: 40,
});

const STORAGE_KEY = "cvmaker_pricing_cache_v2";

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getPrices() {
  const cached = readCache();
  return {
    basic: Number.isFinite(Number(cached?.basic)) ? Number(cached.basic) : DEFAULT_PRICES.basic,
    professional: Number.isFinite(Number(cached?.professional)) ? Number(cached.professional) : DEFAULT_PRICES.professional,
    customClone: Number.isFinite(Number(cached?.customClone)) ? Number(cached.customClone) : DEFAULT_PRICES.customClone,
  };
}

export function getTemplateOverrides() {
  const cached = readCache();
  return cached?.templates && typeof cached.templates === "object" ? cached.templates : {};
}

export function getTemplateOverride(templateId) {
  return getTemplateOverrides()[templateId] || null;
}

export function setPricingCache(data) {
  if (!data || typeof data !== "object") return;
  const next = {
    basic: Math.max(1, Math.round(Number(data.basic) || DEFAULT_PRICES.basic)),
    professional: Math.max(1, Math.round(Number(data.professional) || DEFAULT_PRICES.professional)),
    customClone: Math.max(1, Math.round(Number(data.customClone) || DEFAULT_PRICES.customClone)),
    templates: data.templates && typeof data.templates === "object" ? data.templates : {},
    updatedAt: data.updatedAt || Date.now(),
  };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  window.dispatchEvent(new CustomEvent("cvmaker-prices-updated", { detail: next }));
}

export function getPriceForTemplate(templateId, getTemplateById) {
  const tpl = getTemplateById?.(templateId);
  const category = tpl?.category || "Basic";
  const override = getTemplateOverride(templateId);
  const prices = getPrices();
  const price = override
    ? (override.free ? 0 : Math.max(0, Number(override.price) || 0))
    : category === "Basic" ? prices.basic : prices.professional;
  const free = Boolean(override?.free) || price === 0;
  return {
    tier: category.toLowerCase(),
    price: free ? 0 : price,
    free,
    title: free ? `${tpl?.name || "Template"} (Free)` : `${tpl?.name || "Template"} PDF`,
    desc: free ? "Free download • No watermark" : category === "Basic" ? "Standard quality • Instant download • No watermark" : "HD quality • No watermark • Print ready",
    isPro: true,
    templateId: templateId || "",
    templateName: tpl?.name || "Template",
    category,
  };
}

export function resetPrices() {
  setPricingCache({ ...DEFAULT_PRICES, templates: {} });
  return getPrices();
}

// Kept for backwards compatibility with old imports. These are no longer used
// for payment authority or cross-device synchronization.
export function savePrices(data) { setPricingCache(data); return getPrices(); }
export function exportPricesJson() { return JSON.stringify({ ...getPrices(), templates: getTemplateOverrides() }, null, 2); }
export function importPricesJson(jsonStr) { const data = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr; setPricingCache(data); return data; }
export function getPricesRemoteUrl() { return ""; }
export function savePricesRemoteUrl() { return ""; }
export async function fetchRemotePrices() { return null; }
export function getSheetWebhookUrl() { return ""; }
export function saveSheetWebhookUrl() { return ""; }
