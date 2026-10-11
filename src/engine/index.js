/**
 * Public engine barrel — Data → Layout → Measure → Fit → Pages → PDF
 */
export {
  FONT_SCALE_MIN,
  FONT_SCALE_MAX,
  FONT_SCALE_READABLE_FLOOR,
  getA4AvailableArea,
  detectLayoutKind,
  measureFits,
  applyFontScale,
  findOptimalScale,
  heuristicScaleFromWeight,
  estimateContentWeight,
} from "./measurement.js";

export {
  planPages,
  clampReadableScale,
  describePagePlan,
} from "./pageManager.js";

export { LayoutRouter, resolveLayoutFamily } from "./layoutRouter.jsx";
