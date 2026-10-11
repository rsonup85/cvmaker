/**
 * CVMaker AI - Master Template Catalog
 * 
 * Single source of truth for:
 * - Exactly 200 active Job / Resume templates (`job-001` through `job-200`)
 * - Exactly 200 active Marriage Biodata templates (`marriage-001` through `marriage-200`)
 * - Backward-compatible legacy aliases (base, job-studio-1..8, marriage-1..30)
 * 
 * PURE JAVASCRIPT/TYPESCRIPT: Zero React/DOM/browser imports.
 * Safe for use by Vite frontend, React renderers, serverless API, and PDF generator.
 */

export type TemplateType = 'job' | 'marriage';
export type PricingTier = 'basic' | 'professional' | 'customClone';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface TemplateConfig {
  id: string;
  templateNo: number;
  name: string;
  description: string;
  type: TemplateType;
  category: string;
  pricingCategory: PricingTier;
  layoutFamily: string;
  palette: ColorPalette;
  fontFamily: {
    heading: string;
    body: string;
  };
  photoStyle: 'none' | 'circle' | 'square' | 'rounded' | 'arch';
  headerStyle: 'left' | 'center' | 'split' | 'banner' | 'sidebar' | 'royal-arch';
  dividerStyle: 'solid' | 'double' | 'dotted' | 'gradient' | 'gold-bar' | 'mandala-dot' | 'accent-pill' | 'none';
  borderStyle: 'none' | 'clean-frame' | 'gold-double' | 'royal-corner' | 'subtle-line' | 'temple-arch';
  motif?: 'ganesh' | 'om' | 'swastik' | 'kalash' | 'khanda' | 'cross' | 'crescent' | 'floral' | 'none';
  atsScore?: number;
  tags: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

// -------------------------------------------------------------
// Curated Palettes for Job Resumes
// -------------------------------------------------------------
const JOB_PALETTES: ColorPalette[] = [
  { primary: '#0f172a', secondary: '#334155', accent: '#2563eb', bg: '#ffffff', surface: '#f8fafc', text: '#0f172a', muted: '#64748b', border: '#e2e8f0' }, // Slate Pro
  { primary: '#1e3a8a', secondary: '#1d4ed8', accent: '#3b82f6', bg: '#ffffff', surface: '#eff6ff', text: '#1e293b', muted: '#64748b', border: '#cbd5e1' }, // Royal Blue
  { primary: '#047857', secondary: '#059669', accent: '#10b981', bg: '#ffffff', surface: '#ecfdf5', text: '#064e3b', muted: '#6b7280', border: '#d1fae5' }, // Emerald Tech
  { primary: '#111827', secondary: '#374151', accent: '#4b5563', bg: '#ffffff', surface: '#f9fafb', text: '#111827', muted: '#6b7280', border: '#e5e7eb' }, // Monochrome ATS
  { primary: '#831843', secondary: '#9f1239', accent: '#be123c', bg: '#ffffff', surface: '#fff1f2', text: '#4c0519', muted: '#881337', border: '#fecdd3' }, // Executive Burgundy
  { primary: '#14532d', secondary: '#166534', accent: '#15803d', bg: '#ffffff', surface: '#f0fdf4', text: '#14532d', muted: '#4b5563', border: '#bbf7d0' }, // Forest Pine
  { primary: '#312e81', secondary: '#4338ca', accent: '#6366f1', bg: '#ffffff', surface: '#eef2ff', text: '#1e1b4b', muted: '#6366f1', border: '#c7d2fe' }, // Deep Indigo
  { primary: '#7c2d12', secondary: '#9a3412', accent: '#c2410c', bg: '#ffffff', surface: '#fff7ed', text: '#431407', muted: '#78350f', border: '#fed7aa' }, // Warm Rust
  { primary: '#0e7490', secondary: '#0891b2', accent: '#06b6d4', bg: '#ffffff', surface: '#ecfeff', text: '#164e63', muted: '#64748b', border: '#a5f3fc' }, // Oceanic Cyan
  { primary: '#581c87', secondary: '#6b21a8', accent: '#9333ea', bg: '#ffffff', surface: '#faf5ff', text: '#3b0764', muted: '#7e22ce', border: '#e9d5ff' }, // Royal Violet
  { primary: '#18181b', secondary: '#27272a', accent: '#0284c7', bg: '#ffffff', surface: '#f4f4f5', text: '#09090b', muted: '#71717a', border: '#e4e4e7' }, // Zinc Tech
  { primary: '#365314', secondary: '#4d7c0f', accent: '#65a30d', bg: '#ffffff', surface: '#f7fee7', text: '#1a2e05', muted: '#4d7c0f', border: '#d9f99d' }, // Olive Pro
];

// -------------------------------------------------------------
// Curated Palettes for Marriage Biodata
// -------------------------------------------------------------
const MARRIAGE_PALETTES: ColorPalette[] = [
  { primary: '#800020', secondary: '#b91c1c', accent: '#d97706', bg: '#fffdf9', surface: '#fef2f2', text: '#4a0404', muted: '#78350f', border: '#fde68a' }, // Rajputana Maroon & Gold
  { primary: '#991b1b', secondary: '#b45309', accent: '#f59e0b', bg: '#fffbeb', surface: '#fef3c7', text: '#451a03', muted: '#92400e', border: '#fcd34d' }, // Vedic Sandalwood & Crimson
  { primary: '#1e3a8a', secondary: '#b45309', accent: '#d97706', bg: '#f8fafc', surface: '#f1f5f9', text: '#0f172a', muted: '#475569', border: '#fed7aa' }, // Royal Blue & Champagne Gold
  { primary: '#701a75', secondary: '#9d174d', accent: '#e11d48', bg: '#fdf4ff', surface: '#fae8ff', text: '#4a044e', muted: '#86198f', border: '#f5d0fe' }, // Gulabi Pastel & Ruby
  { primary: '#064e3b', secondary: '#047857', accent: '#b45309', bg: '#f0fdf4', surface: '#dcfce7', text: '#022c22', muted: '#065f46', border: '#bbf7d0' }, // Royal Emerald & Gold
  { primary: '#78350f', secondary: '#92400e', accent: '#d97706', bg: '#fffbeb', surface: '#fef3c7', text: '#451a03', muted: '#78350f', border: '#fde68a' }, // Antique Bronze & Amber
  { primary: '#831843', secondary: '#be123c', accent: '#fb7185', bg: '#fff1f2', surface: '#ffe4e6', text: '#4c0519', muted: '#9f1239', border: '#fecdd3' }, // Rose Petal & Velvet
  { primary: '#1e293b', secondary: '#334155', accent: '#ca8a04', bg: '#f8fafc', surface: '#f1f5f9', text: '#0f172a', muted: '#64748b', border: '#e2e8f0' }, // Modern Ivory & Gold Line
  { primary: '#4c1d95', secondary: '#6d28d9', accent: '#d97706', bg: '#faf5ff', surface: '#f3e8ff', text: '#2e1065', muted: '#5b21b6', border: '#ddd6fe' }, // Imperial Purple & Zari
  { primary: '#155e75', secondary: '#0e7490', accent: '#d97706', bg: '#ecfeff', surface: '#cffafe', text: '#164e63', muted: '#155e75', border: '#a5f3fc' }, // Peacock Teal & Gold
  { primary: '#3f3f46', secondary: '#52525b', accent: '#b45309', bg: '#fafafa', surface: '#f4f4f5', text: '#18181b', muted: '#52525b', border: '#e4e4e7' }, // Contemporary Clean Slate
  { primary: '#854d0e', secondary: '#a16207', accent: '#ca8a04', bg: '#fefce8', surface: '#fef9c3', text: '#422006', muted: '#713f12', border: '#fde047' }, // Saffron Marigold
];

// Layout Families for Job Resumes
export const JOB_LAYOUT_FAMILIES = [
  'ats-classic',
  'modern-corporate',
  'executive-suite',
  'minimal-line',
  'left-sidebar',
  'compact-technical',
  'timeline-pro',
  'elegant-header',
  'govt-standard',
  'academic-editorial',
  'infographic-bar',
  'international-border'
] as const;

// Layout Families for Marriage Biodatas
export const MARRIAGE_LAYOUT_FAMILIES = [
  'royal-rajasthani',
  'vedic-cream',
  'temple-arch',
  'modern-pastel',
  'floral-mandala',
  'minimal-ivory',
  'split-portrait',
  'horoscope-kundali',
  'family-heritage',
  'bilingual-devanagari',
  'contemporary-gold',
  'graceful-borders'
] as const;

// Font Pairings
const FONT_PAIRINGS = [
  { heading: 'Plus Jakarta Sans', body: 'Inter' },
  { heading: 'Playfair Display', body: 'Inter' },
  { heading: 'Cinzel', body: 'Merriweather' },
  { heading: 'Outfit', body: 'Plus Jakarta Sans' },
  { heading: 'Merriweather', body: 'Inter' },
  { heading: 'Rozha One', body: 'Tiro Devanagari Hindi' }
];

// Categories for Job Resumes
export const JOB_CATEGORIES = [
  'ATS-Optimized',
  'Software & IT',
  'Executive & Management',
  'Fresher & College',
  'Government & PSU',
  'Finance & Banking',
  'Sales & Marketing',
  'Academic & Teaching',
  'Healthcare & Medical',
  'Minimalist Clean'
] as const;

// Categories for Marriage Biodatas
export const MARRIAGE_CATEGORIES = [
  'Royal & Traditional',
  'Vedic & Spiritual',
  'Modern Pastel',
  'Kundali & Horoscope',
  'Family Heritage First',
  'Minimalist Elegant',
  'Bilingual Hindi-English',
  'Floral & Mandala',
  'Contemporary Luxury',
  'Print & Frame Friendly'
] as const;

// -------------------------------------------------------------
// Deterministic Generators for 200 Job + 200 Marriage Templates
// -------------------------------------------------------------

function generateJobTemplates(): TemplateConfig[] {
  const templates: TemplateConfig[] = [];
  
  const jobRoles = [
    'Tech Lead', 'Software Engineer', 'Corporate Executive', 'Data Analyst', 'Product Manager',
    'Chartered Accountant', 'Bank PO & Finance', 'UPSC & Civil Services', 'Academic Scholar', 'Full Stack Developer',
    'Marketing Director', 'Sales Consultant', 'Operations Lead', 'HR Professional', 'Medical Practitioner',
    'Design Lead', 'Content Strategist', 'Research Scientist', 'Cloud Architect', 'College Fresher'
  ];

  const subStyles = [
    'Prime', 'Signature', 'Elite', 'Sleek', 'Apex',
    'Vanguard', 'Matrix', 'Pro', 'Nexus', 'Vertex'
  ];

  for (let i = 1; i <= 200; i++) {
    const padId = `job-${String(i).padStart(3, '0')}`;
    const familyIndex = (i - 1) % JOB_LAYOUT_FAMILIES.length;
    const layoutFamily = JOB_LAYOUT_FAMILIES[familyIndex];
    const paletteIndex = (i - 1) % JOB_PALETTES.length;
    const palette = JOB_PALETTES[paletteIndex];
    const fontIndex = (i - 1) % FONT_PAIRINGS.length;
    const fonts = FONT_PAIRINGS[fontIndex];
    const categoryIndex = (i - 1) % JOB_CATEGORIES.length;
    const category = JOB_CATEGORIES[categoryIndex];

    const roleName = jobRoles[(i - 1) % jobRoles.length];
    const subName = subStyles[Math.floor((i - 1) / 20) % subStyles.length];

    // Photo style rule: ATS-classic is mostly 'none', others vary
    let photoStyle: TemplateConfig['photoStyle'] = 'circle';
    if (layoutFamily === 'ats-classic' || layoutFamily === 'govt-standard' || i % 4 === 0) {
      photoStyle = 'none';
    } else if (layoutFamily === 'compact-technical' || layoutFamily === 'international-border') {
      photoStyle = 'square';
    } else if (layoutFamily === 'executive-suite' || layoutFamily === 'left-sidebar') {
      photoStyle = 'rounded';
    }

    // Header style
    let headerStyle: TemplateConfig['headerStyle'] = 'left';
    if (layoutFamily === 'left-sidebar') {
      headerStyle = 'sidebar';
    } else if (layoutFamily === 'elegant-header' || layoutFamily === 'govt-standard') {
      headerStyle = 'center';
    } else if (layoutFamily === 'modern-corporate' || layoutFamily === 'infographic-bar') {
      headerStyle = 'banner';
    } else if (i % 3 === 0) {
      headerStyle = 'split';
    }

    // Divider
    let dividerStyle: TemplateConfig['dividerStyle'] = 'solid';
    if (layoutFamily === 'ats-classic') dividerStyle = 'solid';
    else if (layoutFamily === 'minimal-line') dividerStyle = 'none';
    else if (layoutFamily === 'modern-corporate') dividerStyle = 'accent-pill';
    else if (layoutFamily === 'international-border') dividerStyle = 'double';
    else if (layoutFamily === 'compact-technical') dividerStyle = 'dotted';
    else if (layoutFamily === 'timeline-pro') dividerStyle = 'gradient';

    // Border
    let borderStyle: TemplateConfig['borderStyle'] = 'none';
    if (layoutFamily === 'international-border') borderStyle = 'clean-frame';
    else if (layoutFamily === 'govt-standard') borderStyle = 'subtle-line';
    else if (layoutFamily === 'executive-suite' && i % 2 === 0) borderStyle = 'clean-frame';

    // Pricing tier: first 40 basic, next 160 professional
    const pricingCategory: PricingTier = (i <= 40 || i % 5 === 0) ? 'basic' : 'professional';

    // ATS Score
    const atsScore = layoutFamily === 'ats-classic' ? 98 :
      layoutFamily === 'govt-standard' ? 96 :
      layoutFamily === 'compact-technical' ? 94 :
      layoutFamily === 'minimal-line' ? 92 :
      layoutFamily === 'modern-corporate' ? 89 :
      layoutFamily === 'timeline-pro' ? 84 : 88;

    templates.push({
      id: padId,
      templateNo: i,
      name: `${roleName} ${subName} ${i}`,
      description: `Tailored for ${category} with ${layoutFamily.replace('-', ' ')} structure and ${atsScore}% ATS rating.`,
      type: 'job',
      category,
      pricingCategory,
      layoutFamily,
      palette,
      fontFamily: fonts,
      photoStyle,
      headerStyle,
      dividerStyle,
      borderStyle,
      atsScore,
      tags: [category, layoutFamily, atsScore >= 90 ? 'ATS 90+' : 'Visual Pro', photoStyle === 'none' ? 'No Photo' : 'With Photo'],
      isPopular: i <= 8 || i === 42 || i === 88 || i === 120,
      isNew: i > 170
    });
  }

  return templates;
}

function generateMarriageTemplates(): TemplateConfig[] {
  const templates: TemplateConfig[] = [];

  const royalNames = [
    'Rajputana Heritage', 'Vedic Kalyanam', 'Maharani Elegance', 'Mandap Auspicious', 'Sandalwood Shloka',
    'Kashi Ganga Divine', 'Mayur Pankh Gold', 'Lotus Blooms', 'Chanderi Silk', 'Jaipur Jharokha',
    'Devbhoomi Grace', 'Gulab Bari Pastel', 'Swarna Bandhan', 'Shubh Lagna', 'Kundan Zari',
    'Gajraj Imperial', 'Pavitra Rishta', 'Ananda Mangalam', 'Vrindavan Grace', 'Parampara Heritage'
  ];

  const royalModifiers = [
    'Royal Gold', 'Divine Zari', 'Ivory Crown', 'Crimson Shubh', 'Emerald Splendor',
    'Roseate Silk', 'Champagne Star', 'Vedic Grace', 'Marigold Glow', 'Heritage Seal'
  ];

  const motifs: TemplateConfig['motif'][] = [
    'ganesh', 'om', 'swastik', 'kalash', 'floral', 'ganesh', 'kalash', 'none', 'khanda', 'floral'
  ];

  for (let i = 1; i <= 200; i++) {
    const padId = `marriage-${String(i).padStart(3, '0')}`;
    const familyIndex = (i - 1) % MARRIAGE_LAYOUT_FAMILIES.length;
    const layoutFamily = MARRIAGE_LAYOUT_FAMILIES[familyIndex];
    const paletteIndex = (i - 1) % MARRIAGE_PALETTES.length;
    const palette = MARRIAGE_PALETTES[paletteIndex];
    const fontIndex = (i - 1) % FONT_PAIRINGS.length;
    const fonts = FONT_PAIRINGS[fontIndex];
    const categoryIndex = (i - 1) % MARRIAGE_CATEGORIES.length;
    const category = MARRIAGE_CATEGORIES[categoryIndex];

    const baseName = royalNames[(i - 1) % royalNames.length];
    const modName = royalModifiers[Math.floor((i - 1) / 20) % royalModifiers.length];

    // Motif assignment
    const motif = motifs[(i - 1) % motifs.length];

    // Photo style
    let photoStyle: TemplateConfig['photoStyle'] = 'arch';
    if (layoutFamily === 'minimal-ivory') photoStyle = 'rounded';
    else if (layoutFamily === 'modern-pastel') photoStyle = 'circle';
    else if (layoutFamily === 'split-portrait') photoStyle = 'square';
    else if (layoutFamily === 'temple-arch' || layoutFamily === 'royal-rajasthani') photoStyle = 'arch';
    else if (i % 6 === 0) photoStyle = 'none';

    // Header style
    let headerStyle: TemplateConfig['headerStyle'] = 'royal-arch';
    if (layoutFamily === 'split-portrait') headerStyle = 'split';
    else if (layoutFamily === 'minimal-ivory') headerStyle = 'center';
    else if (layoutFamily === 'bilingual-devanagari') headerStyle = 'banner';
    else if (layoutFamily === 'contemporary-gold') headerStyle = 'left';

    // Border style
    let borderStyle: TemplateConfig['borderStyle'] = 'gold-double';
    if (layoutFamily === 'temple-arch') borderStyle = 'temple-arch';
    else if (layoutFamily === 'royal-rajasthani') borderStyle = 'royal-corner';
    else if (layoutFamily === 'minimal-ivory') borderStyle = 'subtle-line';
    else if (layoutFamily === 'graceful-borders') borderStyle = 'gold-double';
    else if (layoutFamily === 'modern-pastel') borderStyle = 'clean-frame';

    // Divider style
    let dividerStyle: TemplateConfig['dividerStyle'] = 'gold-bar';
    if (layoutFamily === 'floral-mandala') dividerStyle = 'mandala-dot';
    else if (layoutFamily === 'modern-pastel') dividerStyle = 'gradient';
    else if (layoutFamily === 'minimal-ivory') dividerStyle = 'solid';

    // Pricing tier
    const pricingCategory: PricingTier = (i <= 40 || i % 5 === 0) ? 'basic' : 'professional';

    templates.push({
      id: padId,
      templateNo: i,
      name: `${baseName} ${modName} ${i}`,
      description: `Traditional Indian matrimonial biodata featuring ${category.toLowerCase()} styling, ${layoutFamily.replace('-', ' ')} presentation and auspicious motifs.`,
      type: 'marriage',
      category,
      pricingCategory,
      layoutFamily,
      palette,
      fontFamily: fonts,
      photoStyle,
      headerStyle,
      dividerStyle,
      borderStyle,
      motif,
      tags: [category, layoutFamily, motif !== 'none' ? `Motif: ${motif}` : 'Clean Modern', photoStyle === 'none' ? 'No Photo' : 'Portrait Frame'],
      isPopular: i <= 8 || i === 31 || i === 77 || i === 108,
      isNew: i > 175
    });
  }

  return templates;
}

// -------------------------------------------------------------
// Singleton Master Array
// -------------------------------------------------------------
export const ALL_JOB_TEMPLATES: TemplateConfig[] = generateJobTemplates();
export const ALL_MARRIAGE_TEMPLATES: TemplateConfig[] = generateMarriageTemplates();
export const ALL_TEMPLATES: TemplateConfig[] = [...ALL_JOB_TEMPLATES, ...ALL_MARRIAGE_TEMPLATES];

// -------------------------------------------------------------
// Lookup Map & Legacy ID Migration Map
// -------------------------------------------------------------
export const TEMPLATE_LOOKUP_MAP: Record<string, TemplateConfig> = {};

// Register all primary IDs
ALL_TEMPLATES.forEach((tmpl) => {
  TEMPLATE_LOOKUP_MAP[tmpl.id] = tmpl;
});

// Register Legacy Aliases for backwards compatibility with saved drafts & historic purchases:
// 1. Base legacy ID
TEMPLATE_LOOKUP_MAP['base'] = ALL_JOB_TEMPLATES[0];

// 2. Old Job Studio IDs (job-studio-1 .. job-studio-8)
for (let j = 1; j <= 8; j++) {
  TEMPLATE_LOOKUP_MAP[`job-studio-${j}`] = ALL_JOB_TEMPLATES[j - 1] || ALL_JOB_TEMPLATES[0];
}

// 3. Old Marriage IDs (marriage-1 .. marriage-30)
for (let m = 1; m <= 30; m++) {
  TEMPLATE_LOOKUP_MAP[`marriage-${m}`] = ALL_MARRIAGE_TEMPLATES[m - 1] || ALL_MARRIAGE_TEMPLATES[0];
}

// 4. Custom clone alias
TEMPLATE_LOOKUP_MAP['custom-clone'] = {
  ...ALL_JOB_TEMPLATES[0],
  id: 'custom-clone',
  name: 'Custom Cloned Template',
  description: 'AI analyzed and generated custom template clone.',
  pricingCategory: 'customClone'
};

/**
 * Resolves any template ID (canonical or legacy alias) to a valid TemplateConfig.
 * Never throws; returns safe default if unrecognized.
 */
export function getTemplateById(id: string | null | undefined, fallbackType: TemplateType = 'job'): TemplateConfig {
  if (!id) {
    return fallbackType === 'job' ? ALL_JOB_TEMPLATES[0] : ALL_MARRIAGE_TEMPLATES[0];
  }

  const normalized = id.trim().toLowerCase();
  if (TEMPLATE_LOOKUP_MAP[normalized]) {
    return TEMPLATE_LOOKUP_MAP[normalized];
  }

  // Handle unpadded IDs like job-1 or marriage-5
  const match = normalized.match(/^(job|marriage)-?(\d+)$/);
  if (match) {
    const type = match[1] as TemplateType;
    const num = parseInt(match[2], 10);
    const padded = `${type}-${String(num).padStart(3, '0')}`;
    if (TEMPLATE_LOOKUP_MAP[padded]) {
      return TEMPLATE_LOOKUP_MAP[padded];
    }
  }

  // Default fallback
  return fallbackType === 'job' ? ALL_JOB_TEMPLATES[0] : ALL_MARRIAGE_TEMPLATES[0];
}

/**
 * Validates whether an ID is a known active or legacy template ID.
 */
export function isValidTemplateId(id: string | null | undefined): boolean {
  if (!id) return false;
  const normalized = id.trim().toLowerCase();
  return Boolean(TEMPLATE_LOOKUP_MAP[normalized]);
}

/**
 * Count helper functions
 */
export function getTemplateCounts(): { jobCount: number; marriageCount: number; totalCount: number } {
  return {
    jobCount: ALL_JOB_TEMPLATES.length,
    marriageCount: ALL_MARRIAGE_TEMPLATES.length,
    totalCount: ALL_TEMPLATES.length
  };
}
