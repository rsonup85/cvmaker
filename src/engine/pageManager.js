/**
 * Page Manager
 * ------------
 * Decides single-page max-fill vs multi-page section split.
 *
 * Policy:
 *  - Prefer 1 page with the largest readable scale.
 *  - If content still overflows below readable floor → mark overflow
 *    (callers can show page-2 chrome / split sections later).
 *
 * Full section-level DOM splitting is template-specific; this module
 * provides the decision + page metadata so PDF / preview stay consistent.
 */

import {
  findOptimalScale,
  measureFits,
  FONT_SCALE_READABLE_FLOOR,
  getA4AvailableArea,
} from "./measurement.js";

/**
 * @typedef {Object} PagePlan
 * @property {number} scale
 * @property {boolean} singlePage
 * @property {number} estimatedPages  // 1 or 2+
 * @property {boolean} preferPagination
 * @property {{ used: number, avail: number, ratio: number } | null} measure
 */

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

/**
 * Soft clamp: never go below readable floor for on-screen preview when
 * multi-page is allowed. PDF export can still shrink slightly if forced.
 */
export function clampReadableScale(scale, allowTiny = false) {
  if (allowTiny) return scale;
  return Math.max(FONT_SCALE_READABLE_FLOOR * 0.95, scale);
}

export function describePagePlan(plan) {
  if (!plan) return "";
  if (plan.singlePage) return `1 page · scale ${plan.scale}`;
  return `${plan.estimatedPages} pages · scale ${plan.scale} (pagination preferred)`;
}

export { getA4AvailableArea };
