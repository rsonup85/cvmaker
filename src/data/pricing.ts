/**
 * CVMaker AI - Pricing Configuration & Product Resolver
 * 
 * Server-authoritative defaults:
 * - Basic: ₹9 (INR 900 paise)
 * - Professional: ₹21 (INR 2100 paise)
 * - Custom Template Clone: ₹40 (INR 4000 paise)
 */

import { getTemplateById, TemplateConfig } from './catalog';

export interface PricingConfig {
  basic: number;
  professional: number;
  customClone: number;
  grandLaunchEnabled: boolean;
  templates?: Record<string, number>;
}

export const DEFAULT_PRICING: PricingConfig = {
  basic: 9,
  professional: 21,
  customClone: 40,
  grandLaunchEnabled: false,
  templates: {}
};

/**
 * Resolves product category, display price, and currency for any template ID
 */
export function resolveTemplatePrice(
  templateId: string,
  overrides?: Partial<PricingConfig>
): {
  template: TemplateConfig;
  priceInRupees: number;
  priceInPaise: number;
  currency: string;
  isFree: boolean;
  tier: 'basic' | 'professional' | 'customClone';
} {
  const template = getTemplateById(templateId);
  const pricing = { ...DEFAULT_PRICING, ...(overrides || {}) };

  // Check per-template override first
  if (pricing.templates && typeof pricing.templates[template.id] === 'number') {
    const customPrice = Math.max(0, pricing.templates[template.id]);
    return {
      template,
      priceInRupees: customPrice,
      priceInPaise: Math.round(customPrice * 100),
      currency: 'INR',
      isFree: customPrice === 0,
      tier: template.pricingCategory
    };
  }

  // If grand launch discount is active
  if (pricing.grandLaunchEnabled) {
    return {
      template,
      priceInRupees: 0,
      priceInPaise: 0,
      currency: 'INR',
      isFree: true,
      tier: template.pricingCategory
    };
  }

  let priceInRupees = pricing.basic;
  if (template.pricingCategory === 'professional') {
    priceInRupees = pricing.professional;
  } else if (template.pricingCategory === 'customClone' || template.id === 'custom-clone') {
    priceInRupees = pricing.customClone;
  }

  return {
    template,
    priceInRupees,
    priceInPaise: Math.round(priceInRupees * 100),
    currency: 'INR',
    isFree: priceInRupees === 0,
    tier: template.pricingCategory
  };
}
