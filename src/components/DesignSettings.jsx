/** Design constants + style helpers (no manual Design Settings UI). */

export const DEFAULT_DESIGN = {
  pageSize: "A4",
  customWidth: 210,
  customHeight: 297,
  marginTop: 12,
  marginBottom: 12,
  marginLeft: 8,
  marginRight: 8,
  contentScale: 100,
  fontSize: 10.5,
  lineSpacing: 1.15,
  photoSize: 100,
  photoFit: "cover",
  photoPosition: "center",
  sectionSpacing: "normal",
  templateWidth: "normal",
  columnWidth: 34,
  contentOffsetY: 0,
  fitToOnePage: true,
  manualMode: false,
};

const PAGE_PRESETS = {
  A4: { w: 210, h: 297 },
  Letter: { w: 216, h: 279 },
};

export function getPageDims(settings = {}) {
  if (settings.pageSize === "Custom") {
    return {
      w: Math.max(100, Number(settings.customWidth) || 210),
      h: Math.max(100, Number(settings.customHeight) || 297),
    };
  }
  return PAGE_PRESETS[settings.pageSize] || PAGE_PRESETS.A4;
}

export function designToStyle(settings = {}) {
  const dims = getPageDims(settings);
  const mt = Number(settings.marginTop) || 0;
  const mb = Number(settings.marginBottom) || 0;
  const ml = Number(settings.marginLeft) || 0;
  const mr = Number(settings.marginRight) || 0;
  const scale = (Number(settings.contentScale) || 100) / 100;
  const lineH = Number(settings.lineSpacing) || 1.15;
  const fontBase = Number(settings.fontSize) || 10.5;
  const offsetY = Number(settings.contentOffsetY) || 0;

  let padScale = 1;
  if (settings.templateWidth === "narrow") padScale = 1.12;
  if (settings.templateWidth === "wide") padScale = 0.88;

  return {
    width: `${dims.w}mm`,
    height: `${dims.h}mm`,
    minHeight: `${dims.h}mm`,
    maxHeight: `${dims.h}mm`,
    paddingTop: `${mt * padScale}mm`,
    paddingBottom: `${mb * padScale}mm`,
    paddingLeft: `${ml * padScale}mm`,
    paddingRight: `${mr * padScale}mm`,
    boxSizing: "border-box",
    overflow: "hidden",
    "--resume-content-scale": String(scale),
    "--resume-line-height": String(lineH),
    "--resume-font-base": `${fontBase}px`,
    "--resume-photo-size": `${Number(settings.photoSize) || 100}px`,
    "--resume-photo-fit": settings.photoFit || "cover",
    "--resume-photo-position": settings.photoPosition || "center",
    "--resume-column-width": `${Number(settings.columnWidth) || 50}%`,
    "--resume-offset-y": `${offsetY}mm`,
    lineHeight: lineH,
  };
}
