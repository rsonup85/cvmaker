import { MARRIAGE_TEMPLATE_CONFIGS } from "../components/MarriageTemplateEngine";
import { JOB_STUDIO_CONFIGS } from "../components/JobStudioTemplateEngine";

// ============================================================
// CV TEMPLATES — Basic + Professional template catalog
// Colors via curated palettes (harmonious combinations)
// ============================================================

export const COLOR_PALETTES = [
  {
    id: "navy",
    name: "Navy Blue",
    primary: "#1e3a5f",
    accent: "#2563eb",
    headerBg: "#1e3a5f",
    sectionBg: "#dbeafe",
    text: "#1e293b",
    secondary: "#64748b",
    sidebarBg: "#0f172a",
    sidebarText: "#e2e8f0",
    sidebarPrimary: "#93c5fd",
  },
  {
    id: "royal",
    name: "Royal Blue",
    primary: "#1d4ed8",
    accent: "#3b82f6",
    headerBg: "#1d4ed8",
    sectionBg: "#dbeafe",
    text: "#1e293b",
    secondary: "#64748b",
    sidebarBg: "#1e3a8a",
    sidebarText: "#e0e7ff",
    sidebarPrimary: "#93c5fd",
  },
  {
    id: "teal",
    name: "Teal",
    primary: "#0f766e",
    accent: "#14b8a6",
    headerBg: "#0f766e",
    sectionBg: "#ccfbf1",
    text: "#134e4a",
    secondary: "#64748b",
    sidebarBg: "#134e4a",
    sidebarText: "#ccfbf1",
    sidebarPrimary: "#5eead4",
  },
  {
    id: "emerald",
    name: "Emerald",
    primary: "#047857",
    accent: "#10b981",
    headerBg: "#047857",
    sectionBg: "#d1fae5",
    text: "#064e3b",
    secondary: "#64748b",
    sidebarBg: "#064e3b",
    sidebarText: "#d1fae5",
    sidebarPrimary: "#6ee7b7",
  },
  {
    id: "slate",
    name: "Slate",
    primary: "#334155",
    accent: "#475569",
    headerBg: "#334155",
    sectionBg: "#e2e8f0",
    text: "#1e293b",
    secondary: "#64748b",
    sidebarBg: "#1e293b",
    sidebarText: "#f1f5f9",
    sidebarPrimary: "#94a3b8",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    primary: "#27272a",
    accent: "#52525b",
    headerBg: "#27272a",
    sectionBg: "#f4f4f5",
    text: "#18181b",
    secondary: "#71717a",
    sidebarBg: "#18181b",
    sidebarText: "#f4f4f5",
    sidebarPrimary: "#a1a1aa",
  },
  {
    id: "burgundy",
    name: "Burgundy",
    primary: "#9f1239",
    accent: "#e11d48",
    headerBg: "#9f1239",
    sectionBg: "#ffe4e6",
    text: "#4c0519",
    secondary: "#78716c",
    sidebarBg: "#4c0519",
    sidebarText: "#ffe4e6",
    sidebarPrimary: "#fda4af",
  },
  {
    id: "indigo",
    name: "Indigo",
    primary: "#4338ca",
    accent: "#6366f1",
    headerBg: "#4338ca",
    sectionBg: "#e0e7ff",
    text: "#312e81",
    secondary: "#64748b",
    sidebarBg: "#312e81",
    sidebarText: "#e0e7ff",
    sidebarPrimary: "#a5b4fc",
  },
  {
    id: "forest",
    name: "Forest",
    primary: "#166534",
    accent: "#22c55e",
    headerBg: "#166534",
    sectionBg: "#dcfce7",
    text: "#14532d",
    secondary: "#64748b",
    sidebarBg: "#14532d",
    sidebarText: "#dcfce7",
    sidebarPrimary: "#86efac",
  },
  {
    id: "copper",
    name: "Copper",
    primary: "#9a3412",
    accent: "#ea580c",
    headerBg: "#9a3412",
    sectionBg: "#ffedd5",
    text: "#7c2d12",
    secondary: "#78716c",
    sidebarBg: "#7c2d12",
    sidebarText: "#ffedd5",
    sidebarPrimary: "#fdba74",
  },
  {
    id: "ocean",
    name: "Ocean",
    primary: "#0369a1",
    accent: "#0ea5e9",
    headerBg: "#0369a1",
    sectionBg: "#e0f2fe",
    text: "#0c4a6e",
    secondary: "#64748b",
    sidebarBg: "#0c4a6e",
    sidebarText: "#e0f2fe",
    sidebarPrimary: "#7dd3fc",
  },
  {
    id: "plum",
    name: "Plum",
    primary: "#6b21a8",
    accent: "#a855f7",
    headerBg: "#6b21a8",
    sectionBg: "#f3e8ff",
    text: "#581c87",
    secondary: "#64748b",
    sidebarBg: "#581c87",
    sidebarText: "#f3e8ff",
    sidebarPrimary: "#d8b4fe",
  },
];

export const TEMPLATES_CONFIG = [
  {
    id: "tpl-b-001",
    name: "Classic Clean",
    category: "Basic",
    desc: "Simple, clean single-column layout — easy to read and ATS-friendly.",
    layoutType: "single-column",
    styles: {
      fontFamily: "Inter, system-ui, Arial, sans-serif",
      primaryColor: "#0f172a",
      secondaryColor: "#64748b",
      accentColor: "#475569",
      headerBg: "#ffffff",
      sectionBg: "#f8fafc",
      textColor: "#334155",
      headerStyle: "underline",
      spacing: "normal",
      showSignature: false,
      educationStyle: "list",
    },
  },
  // Professional job studio layouts (user-supplied designs)
  ...JOB_STUDIO_CONFIGS,
  // Exact user-supplied Hindu Marriage Biodata templates.
  ...MARRIAGE_TEMPLATE_CONFIGS,
];

export function getTemplateById(id) {
  return TEMPLATES_CONFIG.find((t) => t.id === id) || TEMPLATES_CONFIG[0];
}

export function getAllCategories() {
  const order = ["Basic", "Professional", "Hindu Marriage"];
  const present = [...new Set(TEMPLATES_CONFIG.map((t) => t.category))];
  return order.filter((c) => present.includes(c));
}

export function getPaletteById(id) {
  return COLOR_PALETTES.find((p) => p.id === id) || COLOR_PALETTES[0];
}

/** Merge template structural styles with a harmonious color palette */
export function applyPalette(templateStyles, palette) {
  const base = templateStyles || {};
  if (!palette) {
    // fallback defaults if no palette
    return {
      ...base,
      primaryColor: base.primaryColor || "#1e3a5f",
      accentColor: base.accentColor || "#2563eb",
      headerBg: base.headerBg || "#1e3a5f",
      sectionBg: base.sectionBg || "#dbeafe",
      textColor: base.textColor || "#1e293b",
      secondaryColor: base.secondaryColor || "#64748b",
      sidebarBg: base.sidebarBg || "#0f172a",
      sidebarText: base.sidebarText || "#e2e8f0",
    };
  }
  return {
    ...base,
    primaryColor: palette.primary,
    accentColor: palette.accent,
    headerBg: palette.headerBg,
    sectionBg: palette.sectionBg,
    textColor: palette.text,
    secondaryColor: palette.secondary,
    sidebarBg: palette.sidebarBg,
    sidebarText: palette.sidebarText,
    // For dark sidebars, use light primary for name text on dark bg
    sidebarPrimary: palette.sidebarPrimary || palette.accent,
  };
}
