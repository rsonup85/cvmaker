/**
 * Measurement Engine
 * ------------------
 * Single source of truth for "does content fit on one A4 page?"
 * and binary-search of the optimal readable font scale.
 *
 * Architecture:
 *   resumeData → Layout Engine → DOM (#resume-document)
 *                              → Measurement Engine (this file)
 *                              → scale / fit / overflow decision
 */

export const FONT_SCALE_MIN = 0.72;
export const FONT_SCALE_MAX = 1.85;
export const FONT_SCALE_READABLE_FLOOR = 0.82; // below this → prefer pagination

const MM_TO_PX = 96 / 25.4; // CSS px at 96dpi

/** A4 available content box in px given design margins (mm). */
export function getA4AvailableArea(designSettings = {}) {
  const pageWmm = designSettings.pageSize === "Letter" ? 216 : 210;
  const pageHmm = designSettings.pageSize === "Letter" ? 279 : 297;
  const mt = Number(designSettings.marginTop) || 12;
  const mb = Number(designSettings.marginBottom) || 12;
  const ml = Number(designSettings.marginLeft) || 8;
  const mr = Number(designSettings.marginRight) || 8;
  return {
    pageWmm,
    pageHmm,
    pageWpx: pageWmm * MM_TO_PX,
    pageHpx: pageHmm * MM_TO_PX,
    contentWpx: Math.max(40, (pageWmm - ml - mr) * MM_TO_PX),
    contentHpx: Math.max(40, (pageHmm - mt - mb) * MM_TO_PX),
    margins: { mt, mb, ml, mr },
  };
}

/**
 * Detect layout family from the live DOM node.
 */
export function detectLayoutKind(el) {
  if (!el) return "generic";
  if (el.classList?.contains("hm-design-page") || el.querySelector?.(".hm-exact-wrap")) return "marriage";
  if (el.classList?.contains("job-simple-page") || el.querySelector?.(".job-simple-page")) return "job";
  return "resume";
}

/**
 * Measure whether content currently fits inside the page surface.
 * Temporarily unlocks overflow constraints so scrollHeight is truthful.
 */
export function measureFits(el, kind = null) {
  if (!el) return { fits: true, used: 0, avail: 1, overflowPx: 0 };
  const layout = kind || detectLayoutKind(el);

  if (layout === "marriage") {
    const wrap = el.querySelector(".hm-exact-wrap");
    const card = wrap?.firstElementChild;
    if (wrap && card) {
      const avail = wrap.clientHeight || 1;
      const prev = {
        overflow: card.style.overflow,
        maxHeight: card.style.maxHeight,
        minHeight: card.style.minHeight,
        height: card.style.height,
      };
      card.style.overflow = "visible";
      card.style.maxHeight = "none";
      card.style.minHeight = "0";
      card.style.height = "auto";
      const used = card.scrollHeight;
      card.style.overflow = prev.overflow;
      card.style.maxHeight = prev.maxHeight;
      card.style.minHeight = prev.minHeight;
      card.style.height = prev.height;
      return {
        fits: used <= avail - 2,
        used,
        avail,
        overflowPx: Math.max(0, used - avail),
        ratio: used / avail,
      };
    }
  }

  if (layout === "job") {
    const page = el.classList.contains("job-simple-page")
      ? el
      : el.querySelector(".job-simple-page") || el;
    const prevOverflow = page.style.overflow;
    page.style.overflow = "visible";
    const contentH = page.scrollHeight;
    page.style.overflow = prevOverflow;
    const cs = getComputedStyle(page);
    const padT = parseFloat(cs.paddingTop) || 0;
    const padB = parseFloat(cs.paddingBottom) || 0;
    const avail = Math.max(1, page.clientHeight - padT - padB);
    const used = Math.max(0, contentH - padT - padB);
    return {
      fits: used <= avail - 2,
      used,
      avail,
      overflowPx: Math.max(0, used - avail),
      ratio: used / avail,
    };
  }

  // Generic resume layouts
  const avail = Math.max(1, el.clientHeight);
  const used = el.scrollHeight;
  return {
    fits: used <= avail - 4,
    used,
    avail,
    overflowPx: Math.max(0, used - avail),
    ratio: used / avail,
  };
}

/**
 * Apply a font scale to the live document (and marriage CSS vars).
 */
export function applyFontScale(el, scale, layout = null) {
  if (!el) return;
  const s = String(Number(scale.toFixed(3)));
  el.style.setProperty("--resume-font-scale", s);
  const kind = layout || detectLayoutKind(el);
  if (kind === "marriage") {
    el.style.setProperty("--hm-font-factor", s);
    el.style.setProperty("--hm-scale", s);
    el.style.setProperty("--hm-user-scale", s);
  }
  // Force reflow
  void el.offsetHeight;
}

/**
 * Binary-search the largest scale that still fits on one page.
 * Returns { scale, fits, preferPagination }.
 *
 * preferPagination = true when even the readable floor overflows —
 * callers should split sections across pages instead of shrinking further.
 */
export function findOptimalScale(el, options = {}) {
  if (!el) return { scale: 1, fits: true, preferPagination: false };

  const {
    min = FONT_SCALE_MIN,
    max = FONT_SCALE_MAX,
    readableFloor = FONT_SCALE_READABLE_FLOOR,
    startHint = 1.2,
    iterations = 14,
  } = options;

  const layout = detectLayoutKind(el);
  const clamp = (v) => Math.max(min, Math.min(max, v));

  // Start from hint
  let lo = min;
  let hi = clamp(startHint);
  applyFontScale(el, hi, layout);
  let m = measureFits(el, layout);

  if (m.fits) {
    // Room to grow — maximize fill
    lo = hi;
    hi = max;
    let best = lo;
    for (let i = 0; i < iterations; i++) {
      const mid = (lo + hi) / 2;
      applyFontScale(el, mid, layout);
      if (measureFits(el, layout).fits) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }
    applyFontScale(el, best, layout);
    return { scale: Number(best.toFixed(3)), fits: true, preferPagination: false };
  }

  // Overflow at hint — search downward
  lo = min;
  hi = clamp(startHint);
  let best = min;
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    applyFontScale(el, mid, layout);
    if (measureFits(el, layout).fits) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  applyFontScale(el, best, layout);
  const final = measureFits(el, layout);
  const preferPagination = !final.fits || best < readableFloor;
  return {
    scale: Number(best.toFixed(3)),
    fits: final.fits,
    preferPagination,
    measure: final,
  };
}

/**
 * Heuristic starting scale from content weight (0 = empty … high = dense).
 */
export function heuristicScaleFromWeight(weight) {
  if (weight <= 6) return 1.7;
  if (weight <= 10) return 1.55;
  if (weight <= 14) return 1.42;
  if (weight <= 20) return 1.28;
  if (weight <= 28) return 1.15;
  if (weight <= 38) return 1.05;
  if (weight <= 50) return 0.95;
  if (weight <= 65) return 0.88;
  if (weight <= 80) return 0.82;
  return 0.76;
}

export function estimateContentWeight(data) {
  if (!data) return 0;
  const fields = [
    data.fullName, data.email, data.phone, data.address, data.summary,
    data.dob, data.birthTime, data.birthPlace, data.rashi, data.nakshatra,
    data.gotra, data.manglik, data.religion, data.caste, data.height,
    data.weight, data.color, data.bloodGroup, data.gradCourse, data.gradCollege,
    data.gradUniv, data.gradDiv, data.interSchool, data.interBoard, data.interDiv,
    data.sscSchool, data.sscBoard, data.sscDiv, data.workExperience, data.income,
    data.fatherName, data.fatherOccupation, data.motherName, data.motherOccupation,
    data.brother, data.sister, data.officeAutomation, data.techKnowledge, data.hobbies,
    data.occupation, data.company, data.role,
  ];
  const text = fields.filter(Boolean).join(" ");
  const lines = Math.ceil(text.length / 60);
  const filled = fields.filter(Boolean).length;
  return lines + filled * 0.5;
}

// ---------- Page Manager (merged) ----------

/**
 * Run measurement on a live #resume-document and return a page plan.
 */
export function planPages(el, options = {}) {
  if (!el) {
    return {
      scale: 1,
      singlePage: true,
      estimatedPages: 1,
      preferPagination: false,
      measure: null,
    };
  }

  const result = findOptimalScale(el, {
    startHint: options.startHint ?? 1.2,
    min: options.min,
    max: options.max,
    readableFloor: options.readableFloor ?? FONT_SCALE_READABLE_FLOOR,
  });

  const measure = result.measure || measureFits(el);
  let estimatedPages = 1;
  if (result.preferPagination && measure?.ratio) {
    estimatedPages = Math.max(1, Math.ceil(measure.ratio));
  } else if (!result.fits) {
    estimatedPages = 2;
  }

  return {
    scale: result.scale,
    singlePage: estimatedPages === 1 && result.fits,
    estimatedPages,
    preferPagination: result.preferPagination,
    measure,
  };
}

export function clampReadableScale(scale, allowTiny = false) {
  if (allowTiny) return scale;
  return Math.max(FONT_SCALE_READABLE_FLOOR * 0.95, scale);
}

export function describePagePlan(plan) {
  if (!plan) return "";
  if (plan.singlePage) return `1 page · scale ${plan.scale}`;
  return `${plan.estimatedPages} pages · scale ${plan.scale} (pagination preferred)`;
}
