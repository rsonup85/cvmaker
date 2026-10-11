/**
 * Master AutoFit — same logic as master-resume-a4.html
 * Phase A: binary-search font scale so content fits 1 page
 * Phase B: boost vertical space (line-height / gaps) to fill empty area
 * Phase C: optical top padding if still under-filled
 *
 * Template-agnostic: measures real DOM of the A4 page element.
 * Works for job, marriage, original, studio, imported, and any future templates.
 */

export const SCALE_MIN = 0.65;
export const SCALE_MAX = 2.80;
export const SPACE_MIN = 0.85;
export const SPACE_MAX = 3.2;

function ensureBaseVars(el) {
  if (el.dataset.afReady) return;
  const cs = getComputedStyle(el);
  el.dataset.afBaseGap = (cs.getPropertyValue("--job-gap").trim() || "1");
  el.dataset.afBaseHmGap = (cs.getPropertyValue("--hm-section-gap").trim() || "1");
  el.dataset.afBaseLine = (
    cs.getPropertyValue("--job-line").trim()
    || cs.getPropertyValue("--hm-line-spacing").trim()
    || "1.15"
  );
  el.dataset.afReady = "1";
}

/**
 * @param {HTMLElement} el - the A4 page root (#resume-document)
 * @param {object} opts
 * @param {HTMLElement|null} opts.bodyEl - optional content body for optical pad
 * @param {boolean} opts.manualMode
 * @param {number} opts.manualScale - contentScale/100
 * @param {number} opts.fontFactor - fontSize/10.5
 * @param {boolean} opts.skipFontFactor - e.g. marriage-500
 * @returns {{ scale: number, space: number, fill: number }}
 */
export function runMasterAutoFit(el, opts = {}) {
  if (!el) return { scale: 1, space: 1, fill: 100 };

  const {
    bodyEl = null,
    manualMode = false,
    manualScale = 1,
    fontFactor = 1,
    skipFontFactor = false,
  } = opts;

  ensureBaseVars(el);

  const applyScale = (scale) => {
    const s = Math.max(SCALE_MIN, Math.min(SCALE_MAX, Number(scale)));
    const fixed = Number(s.toFixed(3));
    el.style.setProperty("--resume-font-scale", String(fixed));
    el.style.setProperty("--hm-scale", String(fixed));
    el.style.setProperty("--hm-user-scale", String(fixed));
    void el.offsetHeight;
    return fixed;
  };

  const applySpace = (boost) => {
    const b = Math.max(SPACE_MIN, Math.min(SPACE_MAX, Number(boost)));
    const fixed = Number(b.toFixed(3));
    el.style.setProperty("--resume-space-boost", String(fixed));
    const baseGap = Number(el.dataset.afBaseGap) || 1;
    const baseHmGap = Number(el.dataset.afBaseHmGap) || 1;
    const baseLine = Number(el.dataset.afBaseLine) || 1.15;
    el.style.setProperty("--job-gap", String(Number((baseGap * fixed).toFixed(3))));
    el.style.setProperty("--hm-section-gap", String(Number((baseHmGap * fixed).toFixed(3))));
    el.style.setProperty("--job-line", String(Number((baseLine * fixed).toFixed(3))));
    el.style.setProperty("--hm-line-spacing", String(Number((baseLine * fixed).toFixed(3))));
    void el.offsetHeight;
    return fixed;
  };

  const measureContentPx = () => {
    const prev = {
      h: el.style.height,
      minH: el.style.minHeight,
      maxH: el.style.maxHeight,
      ov: el.style.overflow,
    };
    el.style.height = "auto";
    el.style.minHeight = "0";
    el.style.maxHeight = "none";
    el.style.overflow = "visible";
    void el.offsetHeight;

    const body = bodyEl || el.querySelector("[data-resume-body]") || el;
    const marriageContent = el.querySelector?.(".hm-exact-wrap");
    const footer = el.querySelector?.("[data-resume-footer], .resume-footer");
    let used;
    if (marriageContent) {
      const rect = marriageContent.getBoundingClientRect();
      const footH = footer ? footer.offsetHeight : 0;
      used = rect.height + footH;
    } else {
      const bodyH = body.scrollHeight || el.scrollHeight;
      const footH = footer ? footer.offsetHeight : 0;
      const cs = getComputedStyle(el);
      const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      used = Math.max(bodyH + footH + padY, el.scrollHeight);
    }

    el.style.height = prev.h;
    el.style.minHeight = prev.minH;
    el.style.maxHeight = prev.maxH;
    el.style.overflow = prev.ov;
    void el.offsetHeight;
    return used;
  };

  const pageTargetPx = () => el.clientHeight;

  if (manualMode) {
    const finalScale = skipFontFactor
      ? Number(manualScale.toFixed(3))
      : Number((manualScale * fontFactor).toFixed(3));
    applyScale(finalScale);
    applySpace(1);
    if (bodyEl) bodyEl.style.paddingTop = "0px";
    return { scale: finalScale, space: 1, fill: 100 };
  }

  // Reset before measuring
  applySpace(1);
  if (bodyEl) bodyEl.style.paddingTop = "0px";
  el.style.height = "";
  el.style.maxHeight = "";
  el.style.overflow = "";

  const avail = pageTargetPx();
  if (avail <= 0) {
    applyScale(1);
    return { scale: 1, space: 1, fill: 100 };
  }

  let bestScale = 1;

  // Phase A: font scale
  applyScale(1);
  let used = measureContentPx();

  if (used > avail - 2) {
    let lo = SCALE_MIN, hi = 1;
    bestScale = SCALE_MIN;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      applyScale(mid);
      used = measureContentPx();
      if (used <= avail - 2) { bestScale = mid; lo = mid; }
      else hi = mid;
    }
    applyScale(bestScale);
  } else {
    let lo = 1, hi = SCALE_MAX;
    bestScale = 1;
    for (let i = 0; i < 18; i++) {
      const mid = (lo + hi) / 2;
      applyScale(mid);
      used = measureContentPx();
      if (used <= avail - 2) { bestScale = mid; lo = mid; }
      else hi = mid;
    }
    applyScale(bestScale);
  }

  // Phase B: space boost
  used = measureContentPx();
  let bestSpace = 1;
  if (used < avail * 0.985) {
    let lo = 1, hi = SPACE_MAX;
    bestSpace = 1;
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2;
      applySpace(mid);
      used = measureContentPx();
      if (used <= avail - 2) { bestSpace = mid; lo = mid; }
      else hi = mid;
    }
    applySpace(bestSpace);
  }

  // Phase C: optical pad
  used = measureContentPx();
  const body = bodyEl || el.querySelector("[data-resume-body]");
  if (body && used < avail * 0.97) {
    let extraPad = Math.max(0, (avail - used) * 0.45);
    body.style.paddingTop = extraPad.toFixed(1) + "px";
    void el.offsetHeight;
    used = measureContentPx();
    if (used > avail - 2) {
      extraPad = Math.max(0, extraPad - (used - avail + 4));
      body.style.paddingTop = extraPad.toFixed(1) + "px";
    }
  }

  const fill = Math.min(100, Math.round((measureContentPx() / Math.max(avail, 1)) * 100));
  return {
    scale: Number(bestScale.toFixed(3)),
    space: Number(bestSpace.toFixed(3)),
    fill,
  };
}
