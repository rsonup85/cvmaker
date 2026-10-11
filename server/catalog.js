export const DEFAULT_PRICING = {
  basic: 9,
  professional: 21,
  customClone: 40,
  templates: {},
};

export const TEMPLATES = {
  'tpl-b-001': { name: 'Classic Clean', category: 'Basic' },
  'tpl-b-101': { name: 'Teal Avatar Split', category: 'Professional' },
  'tpl-b-102': { name: 'Dusty Rose Header', category: 'Professional' },
  'tpl-b-103': { name: 'Dark Wine Sidebar', category: 'Professional' },
  'tpl-b-104': { name: 'Light Blue Arch', category: 'Professional' },
  'tpl-b-105': { name: 'Dark Split Gold', category: 'Professional' },
  'tpl-b-106': { name: 'Pastel Pink', category: 'Professional' },
  'tpl-b-107': { name: 'Navy Circle', category: 'Professional' },
  'tpl-b-108': { name: 'Teal Banner Circle', category: 'Professional' },
  'tpl-m-001': { name: 'Hindu Marriage Biodata – Floral Crimson Red', category: 'Hindu Marriage' },
  'tpl-m-002': { name: 'Hindu Marriage Biodata – Minimal Light Cream', category: 'Hindu Marriage' },
  'tpl-m-003': { name: 'Hindu Marriage Biodata – Corner Leaf Gold', category: 'Hindu Marriage' },
  'tpl-m-004': { name: 'Hindu Marriage Biodata – Traditional Maroon', category: 'Hindu Marriage' },
  'tpl-m-005': { name: 'Hindu Marriage Biodata – Deep Maroon', category: 'Hindu Marriage' },
  'tpl-m-006': { name: 'Hindu Marriage Biodata – Elegant Brown', category: 'Hindu Marriage' },
  'tpl-m-007': { name: 'Hindu Marriage Biodata – Cream Gold', category: 'Hindu Marriage' },
  'tpl-m-008': { name: 'Hindu Marriage Biodata – Devanagari', category: 'Hindu Marriage' },
  'tpl-m-009': { name: 'Cream Brown Double Frame', category: 'Hindu Marriage' },
  'tpl-m-010': { name: 'Floral Navy Om', category: 'Hindu Marriage' },
  'tpl-m-011': { name: 'Circular Photo Cream', category: 'Hindu Marriage' },
  'tpl-m-012': { name: 'Gold Corner Classic', category: 'Hindu Marriage' },
  'tpl-m-013': { name: 'Pink Gold Pill', category: 'Hindu Marriage' },
  'tpl-m-014': { name: 'Modern Blue Circle', category: 'Hindu Marriage' },
  'tpl-m-015': { name: 'Ganesha Cream Ornate', category: 'Hindu Marriage' },
  'tpl-m-016': { name: 'Floral Blossom Om', category: 'Hindu Marriage' },
  'tpl-m-017': { name: 'Gold Circle Classic', category: 'Hindu Marriage' },
  'tpl-m-018': { name: 'Parchment Gold Corners', category: 'Hindu Marriage' },
  'tpl-m-019': { name: 'Garden Green Frame', category: 'Hindu Marriage' },
  'tpl-m-020': { name: 'Brown Ganesha Classic', category: 'Hindu Marriage' },
  'tpl-m-021': { name: 'Red Diamond Border', category: 'Hindu Marriage' },
  'tpl-m-022': { name: 'Maroon Gold Filigree', category: 'Hindu Marriage' },
  'tpl-m-023': { name: 'Gold Badge Sections', category: 'Hindu Marriage' },
  'tpl-m-024': { name: 'Name Header Photo Left', category: 'Hindu Marriage' },
  'tpl-m-025': { name: 'Colorful Ganesha Sides', category: 'Hindu Marriage' },
  'tpl-m-026': { name: 'Hindi Floral Frame', category: 'Hindu Marriage' },
  'tpl-m-027': { name: 'Soft Pink Rose Badge', category: 'Hindu Marriage' },
  'tpl-m-028': { name: 'Royal Red Arch', category: 'Hindu Marriage' },
  'tpl-m-029': { name: 'Peach Dome Circle', category: 'Hindu Marriage' },
  'tpl-m-030': { name: 'Cream Name Card', category: 'Hindu Marriage' },
};

export function cleanPrice(value, fallback, allowZero = false) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return allowZero ? Math.max(0, Math.min(99999, n)) : Math.max(1, Math.min(99999, n));
}

export function resolveProduct(templateId, pricing, product = 'template') {
  if (product === 'custom') {
    return { product: 'custom', templateId: 'custom-clone', templateName: 'AI Custom Template Clone', category: 'Custom', price: pricing.customClone, free: false };
  }
  const template = TEMPLATES[templateId];
  if (!template) throw new Error('Invalid template.');
  const override = pricing.templates?.[templateId];
  const free = Boolean(override?.free);
  const fallback = template.category === 'Basic' ? pricing.basic : pricing.professional;
  const price = free ? 0 : override ? cleanPrice(override.price, fallback, true) : fallback;
  return { product: 'template', templateId, templateName: template.name, category: template.category, price, free };
}
