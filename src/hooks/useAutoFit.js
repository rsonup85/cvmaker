import { useCallback, useEffect, useRef, useState } from "react";
import {
  estimateContentWeight,
  heuristicScaleFromWeight,
  applyFontScale,
  detectLayoutKind,
} from "../engine/measurement.js";
import { planPages, clampReadableScale } from "../engine/pageManager.js";

/**
 * Automatic AutoFit hook.
 *
 * Re-runs measurement whenever data / template / design / viewport changes.
 * User does NOT need to press a button.
 *
 * @param {object} opts
 * @param {React.RefObject} opts.docRef - ref to #resume-document root
 * @param {object} opts.data - resume / biodata form data
 * @param {string} opts.templateId
 * @param {object} opts.designSettings
 * @param {boolean} opts.manualMode - when true, respect user contentScale
 * @param {boolean} opts.enabled - master switch (default true)
 */
export function useAutoFit({
  docRef,
  data,
  templateId,
  designSettings,
  manualMode = false,
  enabled = true,
}) {
  const weight = estimateContentWeight(data);
  const hint = heuristicScaleFromWeight(weight);
  const [scale, setScale] = useState(hint);
  const [pagePlan, setPagePlan] = useState({
    scale: hint,
    singlePage: true,
    estimatedPages: 1,
    preferPagination: false,
  });
  const timerRef = useRef([]);
  const lastKeyRef = useRef("");

  const run = useCallback(
    (force = false) => {
      const el = docRef?.current || document.getElementById("resume-document");
      if (!el) return null;

      if (manualMode && !force) {
        const pct = Number(designSettings?.contentScale) || 100;
        const base = Number(designSettings?.fontSize) || 10.5;
        const factor = (pct / 100) * (base / 10.5);
        const layout = detectLayoutKind(el);
        applyFontScale(el, factor, layout);
        setScale(factor);
        return { scale: factor, manual: true };
      }

      const plan = planPages(el, { startHint: hint });
      const finalScale = clampReadableScale(plan.scale, plan.preferPagination);
      applyFontScale(el, finalScale, detectLayoutKind(el));
      setScale(finalScale);
      setPagePlan({ ...plan, scale: finalScale });
      return plan;
    },
    [docRef, manualMode, designSettings?.contentScale, designSettings?.fontSize, hint]
  );

  // Auto-run on content / template / design changes
  useEffect(() => {
    if (!enabled) return undefined;

    const key = [
      templateId,
      weight,
      designSettings?.pageSize,
      designSettings?.marginTop,
      designSettings?.marginBottom,
      designSettings?.sectionSpacing,
      designSettings?.lineSpacing,
      designSettings?.fontSize,
      designSettings?.contentScale,
      manualMode ? "m" : "a",
      data?.photo ? "photo" : "nophoto",
    ].join("|");

    if (!manualMode && lastKeyRef.current === key) return undefined;
    lastKeyRef.current = key;

    // Staggered runs: fonts/images may settle after first paint
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [
      setTimeout(() => run(), 40),
      setTimeout(() => run(), 220),
      setTimeout(() => run(), 600),
    ];

    return () => timerRef.current.forEach(clearTimeout);
  }, [
    enabled,
    templateId,
    weight,
    data?.photo,
    designSettings?.pageSize,
    designSettings?.marginTop,
    designSettings?.marginBottom,
    designSettings?.sectionSpacing,
    designSettings?.lineSpacing,
    designSettings?.fontSize,
    designSettings?.contentScale,
    manualMode,
    run,
  ]);

  // External force (PDF download, window resize)
  useEffect(() => {
    const handler = () => run(true);
    window.addEventListener("cvmaker-autofit-request", handler);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("cvmaker-autofit-request", handler);
      window.removeEventListener("resize", handler);
    };
  }, [run]);

  return {
    scale,
    pagePlan,
    runAutoFit: run,
    contentWeight: weight,
  };
}
