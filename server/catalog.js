/**
 * CVMaker AI - Server-Side Template Catalog & Pricing Resolver
 * Single source of truth synchronized with frontend catalog.
 */

import { 
  ALL_TEMPLATES, 
  ALL_JOB_TEMPLATES, 
  ALL_MARRIAGE_TEMPLATES, 
  getTemplateById, 
  isValidTemplateId, 
  TEMPLATE_LOOKUP_MAP 
} from '../src/data/catalog.js';

export { 
  ALL_TEMPLATES, 
  ALL_JOB_TEMPLATES, 
  ALL_MARRIAGE_TEMPLATES, 
  getTemplateById, 
  isValidTemplateId, 
  TEMPLATE_LOOKUP_MAP 
};

// Default pricing in INR
export const DEFAULT_PRICING = {
  basic: 9,
  professional: 21,
  customClone: 40,
  grandLaunchEnabled: false,
  templates: {}
};

/**
 * Resolves server-authoritative price for any template ID
 */
export function resolveServerPrice(templateId, pricingConfig = DEFAULT_PRICING) {
  const template = getTemplateById(templateId);
  const pricing = { ...DEFAULT_PRICING, ...(pricingConfig || {}) };

  // Per-template override check
  if (pricing.templates && typeof pricing.templates[template.id] === 'number') {
    const custom = Math.max(0, pricing.templates[template.id]);
    return {
      template,
      amountInRupees: custom,
      amountInPaise: Math.round(custom * 100),
      currency: 'INR',
      isFree: custom === 0,
      tier: template.pricingCategory
    };
  }

  // Grand launch discount check
  if (pricing.grandLaunchEnabled) {
    return {
      template,
      amountInRupees: 0,
      amountInPaise: 0,
      currency: 'INR',
      isFree: true,
      tier: template.pricingCategory
    };
  }

  let amount = pricing.basic;
  if (template.pricingCategory === 'professional') {
    amount = pricing.professional;
  } else if (template.pricingCategory === 'customClone' || template.id === 'custom-clone') {
    amount = pricing.customClone;
  }

  return {
    template,
    amountInRupees: amount,
    amountInPaise: Math.round(amount * 100),
    currency: 'INR',
    isFree: amount === 0,
    tier: template.pricingCategory
  };
}
