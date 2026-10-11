import React, { useState, useLayoutEffect, useRef, useMemo } from "react";
import { getTemplateById, applyPalette, getPaletteById } from "./data/templates";
import { ImportedTemplateRenderer } from "./components/ImportedTemplateRenderer";
import { RichText } from "./components/RichTextEditor";
import OriginalTemplateEngine from "./components/OriginalTemplateEngine";
import MarriageTemplateEngine from "./components/MarriageTemplateEngine";
import JobStudioTemplateEngine from "./components/JobStudioTemplateEngine";

// ---------- Helper: safe number ----------
const safeNum = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export function ResumeRenderer({
  selectedTemplateId,
  data,
  isPro,
  colorPaletteId,
  designSettings,
}) {
  const template = getTemplateById(selectedTemplateId);
  const palette = colorPaletteId ? getPaletteById(colorPaletteId) : null;
  const s = useMemo(() => applyPalette(template.styles || {}, palette), [template, palette]);

  const hobbiesList = useMemo(() => {
    if (!data.hobbies) return [];
    return data.hobbies
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [data.hobbies]);

  const showPhoto = !!data.photo;

  const resumeTextLength = useMemo(() => {
    return [
      data.fullName, data.email, data.phone, data.address, data.summary,
      data.dob, data.birthTime, data.birthPlace, data.rashi, data.nakshatra, data.gotra,
      data.height, data.color, data.bloodGroup, data.fatherName, data.fatherOccupation, data.motherName,
      data.motherOccupation, data.brother, data.sister,
      data.workExperience, data.gradCourse, data.gradCollege, data.gradUniv,
      data.gradDiv, data.interSchool, data.interBoard, data.interDiv,
      data.sscSchool, data.sscBoard, data.sscDiv, data.officeAutomation,
      data.techKnowledge, data.hobbies,
    ].filter(Boolean).join(" ").length;
  }, [data]);

  const heuristicScale = useMemo(() => {
    if (resumeTextLength <= 400) return 1.58;
    if (resumeTextLength <= 700) return 1.45;
    if (resumeTextLength <= 1000) return 1.34;
    if (resumeTextLength <= 1400) return 1.24;
    if (resumeTextLength <= 1800) return 1.14;
    if (resumeTextLength <= 2400) return 1.06;
    if (resumeTextLength <= 3000) return 1.00;
    if (resumeTextLength <= 3600) return 0.94;
    if (resumeTextLength <= 4200) return 0.88;
    return 0.82;
  }, [resumeTextLength]);

  const dataFingerprint = useMemo(() => JSON.stringify(data || {}), [data]);

  const [liveScale, setLiveScale] = useState(heuristicScale);
  const resumeDocRef = useRef(null);

  // ---------- Design settings ----------
  const ds = designSettings || null;
  const pageW = ds
    ? ds.pageSize === "Letter" ? 216
      : ds.pageSize === "Custom" ? Math.max(100, safeNum(ds.customWidth, 210))
      : 210
    : 210;
  const pageH = ds
    ? ds.pageSize === "Letter" ? 279
      : ds.pageSize === "Custom" ? Math.max(100, safeNum(ds.customHeight, 297))
      : 297
    : 297;
  const mTop = ds ? safeNum(ds.marginTop, 12) : 12.7;
  const mBottom = ds ? safeNum(ds.marginBottom, 12) : 12.7;
  const mLeft = ds ? safeNum(ds.marginLeft, 8) : 8;
  const mRight = ds ? safeNum(ds.marginRight, 8) : 8;

  let padMul = 1;
  if (ds?.templateWidth === "narrow") padMul = 1.12;
  if (ds?.templateWidth === "wide") padMul = 0.88;

  const contentScale = ds ? safeNum(ds.contentScale, 100) / 100 : 1;
  const lineH = ds ? safeNum(ds.lineSpacing, 1.15) : undefined;
  const photoPx = ds ? safeNum(ds.photoSize, 72) : 72;
  const manualMode = Boolean(ds?.manualMode);
  const offsetY = ds ? safeNum(ds.contentOffsetY, 0) : 0;
  const colW = ds ? safeNum(ds.columnWidth, 50) : 50;

  const maxOffset = Math.min(mTop, mBottom) * 0.6;
  const clampedOffsetY = Math.max(-maxOffset, Math.min(maxOffset, offsetY));

  const padTop = Math.max(0, mTop * padMul + clampedOffsetY);
  const padBottom = Math.max(0, mBottom * padMul - clampedOffsetY);
  const padLeft = Math.max(0, mLeft * padMul);
  const padRight = Math.max(0, mRight * padMul);

  const a4Style = useMemo(() => ({
    width: `${pageW}mm`,
    height: `${pageH}mm`,
    minHeight: `${pageH}mm`,
    maxHeight: `${pageH}mm`,
    boxSizing: "border-box",
    pageBreakInside: "avoid",
    overflow: "hidden",
    fontFamily: s.fontFamily || "Inter, system-ui, sans-serif",
    color: s.textColor || "#1e293b",
    display: "flex",
    flexDirection: "column",
    paddingTop: `${padTop}mm`,
    paddingLeft: `${padLeft}mm`,
    paddingRight: `${padRight}mm`,
    paddingBottom: `${padBottom}mm`,
    ...(lineH ? { lineHeight: lineH } : {}),
    "--resume-content-scale": String(contentScale),
    "--resume-photo-size": `${photoPx}px`,
    "--resume-column-width": `${colW}%`,
    "--resume-offset-y": `${clampedOffsetY}mm`,
    "--resume-pad-top": `${padTop}mm`,
    "--resume-pad-bottom": `${padBottom}mm`,
    "--resume-pad-left": `${padLeft}mm`,
    "--resume-pad-right": `${padRight}mm`,
    "--resume-photo-fit": ds?.photoFit || "cover",
    "--resume-photo-position": ds?.photoPosition || "center",
    ...(ds?.fontSize ? { "--resume-font-base": `${safeNum(ds.fontSize, 10.5)}px` } : {}),
  }), [
    pageW, pageH, padTop, padBottom, padLeft, padRight,
    lineH, contentScale, photoPx, colW, clampedOffsetY, ds?.fontSize,
    ds?.photoFit, ds?.photoPosition,
    s.fontFamily, s.textColor,
  ]);

  // ---------- Universal AutoFit (master HTML behavior) ----------
  // The master HTML measures content with the fixed page height temporarily
  // removed, then uses binary-search to find the largest safe font scale.
  // We mirror that behavior here and also expose --resume-fit-space so engines
  // that support spacing variables can use Phase-B/Phase-C filling.
  useLayoutEffect(() => {
    // Ref is preferred; selector fallback makes AutoFit work automatically for
    // future templates as long as they render the standard #resume-document root.
    const el = resumeDocRef.current || document.querySelector('#resume-document');
    if (!el) return;

    const setCss = (target, name, value) => {
      if (!target) return;
      target.style.setProperty(name, String(value));
    };

    if (manualMode) {
      const manualScale = safeNum(designSettings?.contentScale, 100) / 100;
      const base = safeNum(designSettings?.fontSize, 10.5);
      const fontFactor = base / 10.5;
      const finalScale = template.layoutType === "marriage-500"
        ? Number(manualScale.toFixed(3))
        : Number((manualScale * fontFactor).toFixed(3));
      setCss(el, "--resume-font-scale", finalScale);
      setCss(el, "--resume-fit-space", 1);
      setCss(el, "--hm-font-factor", finalScale);
      setCss(el, "--hm-section-gap", 1);
      setCss(el, "--job-gap", 1);
      if (liveScale !== finalScale) setLiveScale(finalScale);
      return;
    }

    let cancelled = false;
    let measureClone = null;
    let basePaddingTop = "";

    const prepareMeasureClone = () => {
      try {
        measureClone = el.cloneNode(true);
        measureClone.setAttribute("data-autofit-clone", "true");
        measureClone.style.position = "absolute";
        measureClone.style.left = "-100000px";
        measureClone.style.top = "0";
        measureClone.style.width = `${pageW}mm`;
        measureClone.style.height = "auto";
        measureClone.style.minHeight = "0";
        measureClone.style.maxHeight = "none";
        measureClone.style.overflow = "visible";
        measureClone.style.transform = "none";
        measureClone.style.webkitTransform = "none";
        measureClone.style.margin = "0";
        measureClone.style.visibility = "hidden";
        measureClone.style.pointerEvents = "none";
        measureClone.style.boxShadow = "none";
        measureClone.style.pageBreakInside = "auto";
        measureClone.querySelectorAll("*").forEach((node) => {
          node.removeAttribute("aria-hidden");
          node.style.setProperty("max-height", "none", "important");
          node.style.setProperty("min-height", "0", "important");
          node.style.setProperty("height", "auto", "important");
          node.style.setProperty("overflow", "visible", "important");
        });
        document.body.appendChild(measureClone);
        return true;
      } catch (error) {
        console.warn("AutoFit measurement clone failed:", error);
        measureClone = null;
        return false;
      }
    };

    const applyVars = (target, scale, space) => {
      setCss(target, "--resume-font-scale", scale);
      setCss(target, "--resume-fit-space", space);
      setCss(target, "--hm-scale", scale);
      setCss(target, "--hm-user-scale", scale);
      setCss(target, "--hm-font-factor", scale);
      setCss(target, "--hm-section-gap", space);
      setCss(target, "--job-gap", space);
      setCss(target, "--job-line", `calc(1.15 * ${space})`);
    };

    const applyScale = (scale) => {
      const safe = Math.max(0.65, Math.min(2.80, Number(scale) || 1));
      applyVars(el, safe, 1);
      applyVars(measureClone, safe, Number(measureClone?.style.getPropertyValue("--resume-fit-space")) || 1);
      void el.offsetHeight;
      void measureClone?.offsetHeight;
      return safe;
    };

    const applySpace = (space) => {
      const safe = Math.max(0.85, Math.min(3.20, Number(space) || 1));
      const currentScale = Number(getComputedStyle(el).getPropertyValue("--resume-font-scale")) || 1;
      applyVars(el, currentScale, safe);
      applyVars(measureClone, currentScale, safe);
      void el.offsetHeight;
      void measureClone?.offsetHeight;
      return safe;
    };

    const measureContentPx = () => {
      if (!measureClone) return el.scrollHeight;
      // Root has height:auto and descendant 100%-height constraints are removed.
      // Prefer the flow-content bottom, ignoring absolute decorative layers.
      const rootRect = measureClone.getBoundingClientRect();
      let maxBottom = 0;
      const nodes = [measureClone, ...measureClone.querySelectorAll("*")];
      nodes.forEach((node) => {
        const cs = getComputedStyle(node);
        if (cs.display === "none" || cs.visibility === "hidden") return;
        if (cs.position === "absolute" || cs.position === "fixed") return;
        const rect = node.getBoundingClientRect();
        maxBottom = Math.max(maxBottom, rect.bottom - rootRect.top);
      });
      return Math.max(maxBottom, measureClone.scrollHeight);
    };

    const pageTargetPx = () => Math.max(1, el.clientHeight);

    const fitNow = () => {
      if (cancelled) return;
      basePaddingTop = el.style.paddingTop;
      el.style.setProperty("--resume-fit-space", "1");
      el.style.setProperty("--resume-auto-top-pad", "0px");

      // Reset the exact measurements used by the master HTML algorithm.
      el.style.height = `${pageH}mm`;
      el.style.minHeight = `${pageH}mm`;
      el.style.maxHeight = `${pageH}mm`;
      el.style.overflow = "hidden";

      const prepared = prepareMeasureClone();
      if (!prepared) return;

      const avail = pageTargetPx();
      if (avail <= 0) return;

      let bestScale = 1;
      let bestSpace = 1;

      // Phase A — largest font scale that still fits.
      let lo = 0.65;
      let hi = 2.80;
      applyScale(1);
      let used = measureContentPx();

      if (used > avail - 2) {
        hi = 1;
        for (let i = 0; i < 18; i += 1) {
          const mid = (lo + hi) / 2;
          applyScale(mid);
          used = measureContentPx();
          if (used <= avail - 2) {
            bestScale = mid;
            lo = mid;
          } else {
            hi = mid;
          }
        }
        applyScale(bestScale);
      } else {
        lo = 1;
        hi = 2.80;
        bestScale = 1;
        for (let i = 0; i < 18; i += 1) {
          const mid = (lo + hi) / 2;
          applyScale(mid);
          used = measureContentPx();
          if (used <= avail - 2) {
            bestScale = mid;
            lo = mid;
          } else {
            hi = mid;
          }
        }
        applyScale(bestScale);
      }

      // Phase B — increase supported section/line spacing when the page is still short.
      used = measureContentPx();
      if (used < avail * 0.985) {
        lo = 1;
        hi = 3.2;
        bestSpace = 1;
        for (let i = 0; i < 16; i += 1) {
          const mid = (lo + hi) / 2;
          applySpace(mid);
          used = measureContentPx();
          if (used <= avail - 2) {
            bestSpace = mid;
            lo = mid;
          } else {
            hi = mid;
          }
        }
        applySpace(bestSpace);
      }

      // Phase C — small optical top padding like the master HTML.
      used = measureContentPx();
      if (used < avail * 0.97) {
        const extraPad = Math.max(0, (avail - used) * 0.45);
        const computed = getComputedStyle(el);
        const currentPadTop = parseFloat(computed.paddingTop) || 0;
        el.style.paddingTop = `${currentPadTop + extraPad}px`;
        if (measureClone) measureClone.style.paddingTop = `${currentPadTop + extraPad}px`;
        void el.offsetHeight;
        void measureClone?.offsetHeight;

        const after = measureContentPx();
        if (after > avail - 2) {
          const reduce = after - avail + 4;
          el.style.paddingTop = `${Math.max(0, currentPadTop + extraPad - reduce)}px`;
          if (measureClone) measureClone.style.paddingTop = `${Math.max(0, currentPadTop + extraPad - reduce)}px`;
        }
      }

      const finalScale = Number(bestScale.toFixed(3));
      const finalSpace = Number(bestSpace.toFixed(3));
      applyScale(finalScale);
      applySpace(finalSpace);
      setCss(el, "--resume-fit-space", finalSpace);
      setCss(el, "--resume-auto-top-pad", getComputedStyle(el).paddingTop);

      if (!cancelled) {
        setLiveScale(finalScale);
      }
    };

    const run = () => {
      // Let React finish the current template paint before measuring.
      requestAnimationFrame(() => {
        requestAnimationFrame(fitNow);
      });
    };

    run();

    return () => {
      cancelled = true;
      if (measureClone?.parentNode) measureClone.parentNode.removeChild(measureClone);
      el.style.paddingTop = basePaddingTop;
    };
  }, [
    selectedTemplateId,
    template.layoutType,
    dataFingerprint,
    manualMode,
    designSettings?.contentScale,
    designSettings?.fontSize,
    designSettings?.pageSize,
    designSettings?.marginTop,
    designSettings?.marginBottom,
    designSettings?.marginLeft,
    designSettings?.marginRight,
    pageW,
    pageH,
  ]);

  const autoFontScale = liveScale;

  const autoSpacing = useMemo(() => {
    if (resumeTextLength <= 550) return "relaxed";
    if (resumeTextLength <= 2800) return "normal";
    return "compact";
  }, [resumeTextLength]);

  const effectiveSpacing =
    ds?.sectionSpacing === "compact" || ds?.sectionSpacing === "relaxed" || ds?.sectionSpacing === "normal"
      ? ds.sectionSpacing
      : s.spacing === "compact" || s.spacing === "relaxed"
        ? s.spacing
        : autoSpacing;

  const spacingClass =
    effectiveSpacing === "compact"
      ? "space-y-2.5"
      : effectiveSpacing === "relaxed"
      ? "space-y-5"
      : "space-y-3.5";

  const sectionGapPx =
    effectiveSpacing === "relaxed" ? 22 :
    effectiveSpacing === "compact" ? 10 : 16;

  // ---------- Preview protection ----------
  const previewProtectionProps = !isPro
    ? {
        onContextMenu: (e) => e.preventDefault(),
        onCopy: (e) => e.preventDefault(),
        onCut: (e) => e.preventDefault(),
        onDragStart: (e) => e.preventDefault(),
      }
    : {};

  // ---------- Watermark ----------
  const WatermarkOverlay = () => {
    if (isPro) return null;
    const rows = Array.from({ length: 9 });
    const cols = Array.from({ length: 3 });
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none overflow-hidden z-[50]"
        style={{
          display: "grid",
          gridTemplateRows: "repeat(9, 1fr)",
          gridTemplateColumns: "repeat(3, 1fr)",
          width: "100%",
          height: "100%",
          padding: "10% 3%",
          boxSizing: "border-box",
          opacity: 0.15,
        }}
      >
        {rows.flatMap((_, row) =>
          cols.map((_, col) => (
            <div
              key={`${row}-${col}`}
              className="flex items-center justify-center whitespace-nowrap"
              style={{
                transform: `rotate(-32deg) translateX(${col % 2 ? "8%" : "-8%"})`,
                fontSize: "clamp(10px, 1.55vw, 18px)",
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: "#334155",
                textTransform: "uppercase",
              }}
            >
              CV MAKER AI · PREVIEW · NOT FOR DOWNLOAD
            </div>
          ))
        )}
      </div>
    );
  };

  // ---------- ProfilePhoto ----------
  const ProfilePhoto = ({ size, className = "", rect = false }) => {
    if (!showPhoto) return null;
    const base = photoPx || 72;
    const px = ds ? base : (size ?? base);
    const style = rect
      ? { width: px, height: Math.round(px * 1.2) }
      : { width: px, height: px };
    return (
      <img
        src={data.photo}
        alt="Profile"
        className={`${rect ? "" : "rounded-full"} border-2 border-white shadow-sm ${className}`}
        style={{
          ...style,
          objectFit: "var(--resume-photo-fit, cover)",
          objectPosition: "var(--resume-photo-position, center)",
        }}
        crossOrigin="anonymous"
      />
    );
  };

  // ---------- Section Title ----------
  const SectionTitle = ({ children }) => {
    const style = s.headerStyle;
    if (style === "banner" || style === "dark-bar" || style === "colored-banner") {
      return (
        <div className="px-2 py-0.5 mb-1.5" style={{
          backgroundColor: s.sectionBg || s.headerBg || "#e2e8f0",
          color: style === "colored-banner" || style === "dark-bar" ? "#fff" : s.primaryColor,
          border: style === "banner" ? "1px solid #000" : "none",
        }}>
          <h3 className="font-bold uppercase tracking-wide" style={{ fontSize: "calc(13px * var(--resume-font-scale, 1))" }}>{children}</h3>
        </div>
      );
    }
    if (style === "accent-line") {
      return (
        <div className="mb-1.5">
          <h3 className="font-bold uppercase tracking-wider pb-0.5" style={{
            color: s.primaryColor, borderBottom: `2px solid ${s.accentColor}`,
            fontSize: "calc(13px * var(--resume-font-scale, 1))",
          }}>{children}</h3>
        </div>
      );
    }
    if (style === "left-border") {
      return (
        <div className="mb-1.5 pl-2" style={{ borderLeft: `3px solid ${s.accentColor}` }}>
          <h3 className="font-bold uppercase tracking-wider" style={{ color: s.primaryColor, fontSize: "calc(13px * var(--resume-font-scale, 1))" }}>{children}</h3>
        </div>
      );
    }
    if (style === "underline") {
      return (
        <div className="mb-1.5">
          <h3 className="font-bold uppercase tracking-wider pb-0.5" style={{
            color: s.primaryColor, borderBottom: `2px solid ${s.accentColor || s.primaryColor}`,
            fontSize: "calc(13px * var(--resume-font-scale, 1))",
          }}>{children}</h3>
        </div>
      );
    }
    if (style === "dark-elegant") {
      return (
        <div className="px-2 py-0.5 mb-1.5" style={{ backgroundColor: s.sectionBg || "#f1f5f9" }}>
          <h3 className="font-bold uppercase tracking-wide" style={{ color: s.accentColor || s.primaryColor, fontSize: "calc(13px * var(--resume-font-scale, 1))" }}>{children}</h3>
        </div>
      );
    }
    return (
      <div className="mb-1.5">
        <h3 className="font-bold uppercase tracking-wide" style={{ color: s.primaryColor, fontSize: "calc(13px * var(--resume-font-scale, 1))" }}>{children}</h3>
      </div>
    );
  };

  // ---------- Education Block ----------
  const EducationBlock = () => {
    if (!data.gradCourse && !data.interSchool && !data.sscSchool) return null;
    if (s.educationStyle === "table") {
      return (
        <div>
          <SectionTitle>Educational Qualifications</SectionTitle>
          <table className="w-full border-collapse border border-slate-400" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))" }}>
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-400 p-0.5">Examination</th>
                <th className="border border-slate-400 p-0.5">Institute</th>
                <th className="border border-slate-400 p-0.5">Board / Univ</th>
                <th className="border border-slate-400 p-0.5">Division</th>
              </tr>
            </thead>
            <tbody>
              {data.gradCourse && (
                <tr>
                  <td className="border border-slate-400 p-0.5 font-semibold">{data.gradCourse}</td>
                  <td className="border border-slate-400 p-0.5">{data.gradCollege || "-"}</td>
                  <td className="border border-slate-400 p-0.5">{data.gradUniv || "-"}</td>
                  <td className="border border-slate-400 p-0.5 text-center">{data.gradDiv || "-"}</td>
                </tr>
              )}
              {data.interSchool && (
                <tr>
                  <td className="border border-slate-400 p-0.5 font-semibold">Intermediate (12th)</td>
                  <td className="border border-slate-400 p-0.5">{data.interSchool}</td>
                  <td className="border border-slate-400 p-0.5">{data.interBoard || "-"}</td>
                  <td className="border border-slate-400 p-0.5 text-center">{data.interDiv || "-"}</td>
                </tr>
              )}
              {data.sscSchool && (
                <tr>
                  <td className="border border-slate-400 p-0.5 font-semibold">SSC (10th)</td>
                  <td className="border border-slate-400 p-0.5">{data.sscSchool}</td>
                  <td className="border border-slate-400 p-0.5">{data.sscBoard || "-"}</td>
                  <td className="border border-slate-400 p-0.5 text-center">{data.sscDiv || "-"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <div>
        <SectionTitle>Education</SectionTitle>
        <div className="space-y-1.5" style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))" }}>
          {data.gradCourse && (
            <div className="pl-1" style={{ borderLeft: `2px solid ${s.accentColor || "#94a3b8"}` }}>
              <p className="font-bold">{data.gradCourse}</p>
              {data.gradCollege && <p className="text-slate-600">{data.gradCollege}</p>}
              <p className="text-slate-500" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
                {[data.gradUniv, data.gradDiv].filter(Boolean).join(" • ")}
              </p>
            </div>
          )}
          {data.interSchool && (
            <div className="pl-1" style={{ borderLeft: `2px solid ${s.accentColor || "#94a3b8"}` }}>
              <p className="font-bold">Intermediate (12th)</p>
              <p className="text-slate-600">{data.interSchool}</p>
              <p className="text-slate-500" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
                {[data.interBoard, data.interDiv].filter(Boolean).join(" • ")}
              </p>
            </div>
          )}
          {data.sscSchool && (
            <div className="pl-1" style={{ borderLeft: `2px solid ${s.accentColor || "#94a3b8"}` }}>
              <p className="font-bold">SSC (10th)</p>
              <p className="text-slate-600">{data.sscSchool}</p>
              <p className="text-slate-500" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
                {[data.sscBoard, data.sscDiv].filter(Boolean).join(" • ")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- Skills Block ----------
  const SkillsBlock = () => {
    if (!data.officeAutomation && !data.techKnowledge) return null;
    return (
      <div>
        <SectionTitle>Skills</SectionTitle>
        <div className="space-y-0.5 px-1" style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))" }}>
          {data.officeAutomation && (
            <p><span className="font-semibold">Office Automation:</span> {data.officeAutomation}</p>
          )}
          {data.techKnowledge && (
            <p><span className="font-semibold">Technical:</span> {data.techKnowledge}</p>
          )}
        </div>
      </div>
    );
  };

  // ---------- Hobbies Block ----------
  const HobbiesBlock = () => {
    if (hobbiesList.length === 0) return null;
    return (
      <div>
        <SectionTitle>Hobbies & Interests</SectionTitle>
        <p className="px-1" style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))" }}>
          {hobbiesList.join(" • ")}
        </p>
      </div>
    );
  };

  // ---------- Signature Footer ----------
  const SignatureFooter = () => {
    if (!s.showSignature) return null;
    return (
      <div className="pt-2 border-t border-slate-300 flex justify-between items-end mt-auto" style={{ fontSize: "calc(11.5px * var(--resume-font-scale, 1))" }}>
        <div>
          <p className="font-semibold">Date: ....................</p>
          <p className="font-semibold">Place: ....................</p>
        </div>
        <div className="text-center pr-2">
          <p className="font-bold border-t border-slate-700 pt-0.5 px-3 min-w-[120px]" style={{ color: s.primaryColor }}>
            {data.fullName ? `(${data.fullName.toUpperCase()})` : "( SIGNATURE )"}
          </p>
          <p className="text-[9px] text-slate-500">Signature</p>
        </div>
      </div>
    );
  };

  // ---------- Engines ----------
  if (template.layoutType === "original-200") {
    return (
      <OriginalTemplateEngine
        template={template}
        data={data}
        showPhoto={showPhoto}
        pageW={pageW}
        pageH={pageH}
        autoFontScale={autoFontScale}
        designSettings={designSettings}
        previewProtectionProps={previewProtectionProps}
        resumeDocRef={resumeDocRef}
      />
    );
  }

  if (template.layoutType === "job-studio") {
    return (
      <JobStudioTemplateEngine
        template={template}
        data={data}
        showPhoto={showPhoto}
        pageW={pageW}
        pageH={pageH}
        autoFontScale={autoFontScale}
        designSettings={designSettings}
        previewProtectionProps={previewProtectionProps}
        resumeDocRef={resumeDocRef}
      />
    );
  }

  if (template.layoutType === "marriage-500") {
    return (
      <MarriageTemplateEngine
        template={template}
        data={data}
        showPhoto={showPhoto}
        pageW={pageW}
        pageH={pageH}
        autoFontScale={autoFontScale}
        designSettings={designSettings}
        previewProtectionProps={previewProtectionProps}
        resumeDocRef={resumeDocRef}
      />
    );
  }

  // ---------- JSON+IMAGE ENGINE ----------
  if (template.layoutType === "json-image") {
    const cfg = template;
    const canvas = cfg.canvas || { width: 1185, height: 1536 };
    const elements = Array.isArray(cfg.elements) ? cfg.elements : [];
    const scale = 794 / canvas.width;

    const getValue = (field) => {
      if (field === "educationText") {
        return [
          data.gradCourse && `${data.gradCourse}${data.gradCollege ? ` — ${data.gradCollege}` : ""}`,
          data.interSchool && `Intermediate (12th) — ${data.interSchool}`,
          data.sscSchool && `SSC (10th) — ${data.sscSchool}`,
        ].filter(Boolean).join("\n");
      }
      return data?.[field] ?? "";
    };

    const splitName = (value) => {
      const parts = String(value || "YOUR NAME").trim().split(/\s+/);
      return { first: parts[0] || "YOUR", last: parts.slice(1).join(" ") || "NAME" };
    };

    const JsonElement = ({ item, index }) => {
      const x = safeNum(item.x, 0) * scale;
      const y = safeNum(item.y, 0) * scale;
      const w = item.w != null ? safeNum(item.w, 0) * scale : undefined;
      const h = item.h != null ? safeNum(item.h, 0) * scale : undefined;

      if (item.type === "cover") {
        return (
          <div key={index} style={{
            position: "absolute", left: x, top: y, width: w, height: h,
            background: item.background || "#fff", borderRadius: item.radius ?? 0, zIndex: item.zIndex ?? 2,
          }} />
        );
      }
      if (item.type === "coverCircle") {
        const size = safeNum(item.size || item.w, 100) * scale;
        return (
          <div key={index} style={{
            position: "absolute", left: x, top: y, width: size, height: size,
            borderRadius: "50%", background: item.background || "#fff", zIndex: item.zIndex ?? 2,
          }} />
        );
      }
      if (item.type === "line") {
        return (
          <div key={index} style={{
            position: "absolute", left: x, top: y, width: w, height: h || 2,
            background: item.background || s.primaryColor || "#333", zIndex: item.zIndex ?? 4,
          }} />
        );
      }
      if (item.type === "image") {
        const value = getValue(item.field);
        return (
          <div key={index} style={{
            position: "absolute", left: x, top: y, width: w, height: h,
            borderRadius: item.radius || 0, overflow: "hidden", background: "#eee",
            zIndex: item.zIndex ?? 4, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {value ? (
              <img src={value} alt="Profile" crossOrigin="anonymous"
                style={{
                  width: "100%", height: "100%",
                  objectFit: item.objectFit || "var(--resume-photo-fit, cover)",
                  objectPosition: "var(--resume-photo-position, center)",
                }} />
            ) : (
              <span style={{ fontSize: 9, color: "#999" }}>{item.fallback || "PHOTO"}</span>
            )}
          </div>
        );
      }
      if (item.type === "text") {
        const value = getValue(item.field);
        if (!value) return null;
        let content = value;
        if (item.splitName) {
          const name = splitName(value);
          content = (<><div>{name.first}</div><div>{name.last}</div></>);
        }
        const textStyle = {
          position: "absolute", left: x, top: y, width: w, height: h,
          fontSize: `calc(${safeNum(item.fontSize, 14) * scale}px * var(--resume-font-scale, 1))`,
          lineHeight: item.lineHeight || 1.35,
          fontWeight: item.fontWeight || 400,
          color: item.color || s.textColor || "#333",
          whiteSpace: "pre-line", overflow: "hidden", wordBreak: "break-word",
          zIndex: item.zIndex ?? 5,
          fontFamily: item.fontFamily || s.fontFamily || "Arial, Helvetica, sans-serif",
          textTransform: item.uppercase ? "uppercase" : "none",
        };
        return (
          <div key={index} style={textStyle}>
            {item.label && (
              <div style={{
                color: item.labelColor || s.primaryColor || "#333",
                fontSize: `calc(${safeNum(item.labelSize, 18) * scale}px * var(--resume-font-scale, 1))`,
                fontWeight: item.labelWeight || 700,
                lineHeight: 1.1,
                marginBottom: `calc(${4 * scale}px * var(--resume-fit-space, 1))`,
                borderBottom: item.labelLine ? `1px solid ${item.labelColor || s.primaryColor}` : undefined,
                paddingBottom: item.labelLine ? `calc(${2 * scale}px * var(--resume-fit-space, 1))` : undefined,
              }}>{item.label}</div>
            )}
            <div>{content}</div>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="origin-top transition-transform duration-200" style={{ transform: "scale(1)" }}>
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white relative overflow-hidden"
            style={{
              width: `${pageW}mm`, height: `${pageH}mm`, minHeight: `${pageH}mm`, maxHeight: `${pageH}mm`,
              boxSizing: "border-box",
              fontFamily: cfg.styles?.fontFamily || "Arial, Helvetica, sans-serif",
              "--resume-font-scale": autoFontScale,
            }}
          >
            {cfg.spriteId ? (
              <svg viewBox="0 0 794 1123" aria-hidden="true" focusable="false" preserveAspectRatio="none"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}>
                <use href={`/templates/templates.svg#${cfg.spriteId}`} />
              </svg>
            ) : (
              <div aria-hidden="true" style={{
                position: "absolute", inset: 0,
                backgroundImage: `url(${cfg.canvas?.background || cfg.previewImage})`,
                backgroundSize: "100% 100%", backgroundRepeat: "no-repeat", backgroundPosition: "center", zIndex: 0,
              }} />
            )}
            <div style={{
              position: "absolute", left: 0, top: 0,
              width: `${canvas.width * scale}px`, height: `${canvas.height * scale}px`,
              transformOrigin: "top left",
            }}>
              {elements.map((item, index) => (<JsonElement item={item} index={index} key={index} />))}
            </div>
            <WatermarkOverlay />
          </div>
        </div>
      </div>
    );
  }

  // ---------- SINGLE COLUMN / ACCENT BAR / TIMELINE ----------
  if (
    template.layoutType === "single-column" ||
    template.layoutType === "accent-bar" ||
    template.layoutType === "timeline"
  ) {
    const isAccentBar = template.layoutType === "accent-bar";
    const isTimeline = template.layoutType === "timeline";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative flex flex-col"
            style={{
              ...a4Style,
              "--resume-font-scale": autoFontScale,
              borderLeft: isAccentBar ? `6px solid ${s.accentColor}` : undefined,
              paddingLeft: isAccentBar ? `calc(${padLeft}mm + 6px)` : `${padLeft}mm`,
            }}
          >
            <WatermarkOverlay />
            {s.headerStyle === "colored-banner" || s.headerStyle === "dark-elegant" ? (
              <div className="px-4 py-3 mb-3 -mx-6 -mt-5" style={{ backgroundColor: s.headerBg, color: "#fff" }}>
                <div className="flex items-center gap-3">
                  <ProfilePhoto className="shrink-0 border-white/80" />
                  <div className="flex-1 min-w-0">
                    <h1 className="font-black uppercase tracking-wider" style={{ fontSize: "calc(20px * var(--resume-font-scale, 1))" }}>
                      {data.fullName || "YOUR NAME"}
                    </h1>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 opacity-90" style={{ fontSize: "calc(11.5px * var(--resume-font-scale, 1))" }}>
                      {data.phone && <span>{data.phone}</span>}
                      {data.email && <span>• {data.email}</span>}
                      {data.address && <span>• {data.address}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : s.headerStyle === "banner" ? (
              <>
                <div className="py-1 text-center mb-3 -mx-1" style={{ backgroundColor: s.headerBg }}>
                  <h1 className="text-base font-bold tracking-wider uppercase text-black">Resume</h1>
                </div>
                <div className="mb-3 flex gap-3 items-start">
                  <ProfilePhoto className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    {data.fullName && (
                      <h2 className="font-bold uppercase" style={{ color: s.primaryColor, fontSize: "calc(16px * var(--resume-font-scale, 1))" }}>
                        {data.fullName}
                      </h2>
                    )}
                    {data.address && (<p className="whitespace-pre-line mt-0.5" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))" }}>{data.address}</p>)}
                    {data.phone && (<p className="font-semibold mt-0.5" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))" }}>Mob- {data.phone}</p>)}
                    {data.email && (<p className="font-semibold" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))" }}>E-mail: {data.email}</p>)}
                  </div>
                </div>
                <hr className="border-t border-black mb-3" />
              </>
            ) : (
              <div className="mb-3 text-center border-b-2 pb-2" style={{ borderColor: s.primaryColor }}>
                {showPhoto && (<div className="flex justify-center mb-2"><ProfilePhoto /></div>)}
                <h1 className="font-black uppercase tracking-widest" style={{ color: s.primaryColor, fontSize: "calc(24px * var(--resume-font-scale, 1))" }}>
                  {data.fullName || "CURRICULUM VITAE"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-2 mt-1" style={{ color: s.secondaryColor, fontSize: "calc(11.5px * var(--resume-font-scale, 1))" }}>
                  {data.phone && <span>{data.phone}</span>}
                  {data.email && <span>• {data.email}</span>}
                  {data.address && <span>• {data.address}</span>}
                </div>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className={spacingClass}>
                {data.summary && (
                  <div>
                    <SectionTitle>Career Objective</SectionTitle>
                    <p className="text-justify leading-snug px-1" style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))" }}>
                      <RichText value={data.summary} />
                    </p>
                  </div>
                )}
                {data.workExperience && (
                  <div>
                    <SectionTitle>Work Experience</SectionTitle>
                    {isTimeline ? (
                      <div className="relative pl-4 border-l-2" style={{ borderColor: s.accentColor }}>
                        <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full" style={{ backgroundColor: s.accentColor }} />
                        <p className="whitespace-pre-line leading-snug" style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))" }}>
                          <RichText value={data.workExperience} />
                        </p>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line leading-snug px-1" style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))" }}>
                        <RichText value={data.workExperience} />
                      </p>
                    )}
                  </div>
                )}
                <EducationBlock />
                <SkillsBlock />
                <HobbiesBlock />
              </div>
              <SignatureFooter />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- SIDEBAR LEFT / TWO COLUMN ----------
  if (template.layoutType === "sidebar-left" || template.layoutType === "two-column") {
    const headerBg = s.headerBg || s.sidebarBg || "#1e293b";
    const sidebarBg = s.sectionBg || "#e8eaed";
    const accent = s.accentColor || "#1e293b";
    const primary = s.primaryColor || "#1e293b";

    const ProSectionTitle = ({ children, icon }) => (
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[9px] font-bold" style={{ backgroundColor: headerBg }}>
          {icon || "•"}
        </div>
        <div className="flex-1">
          <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primary }}>{children}</h3>
          <div className="h-[2px] mt-0.5 w-full" style={{ backgroundColor: accent, opacity: 0.35 }} />
        </div>
      </div>
    );
    const SidebarHeading = ({ children }) => (
      <div className="mb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primary }}>{children}</h3>
        <div className="h-[2px] mt-1 w-full" style={{ backgroundColor: primary, opacity: 0.5 }} />
      </div>
    );
    const skillItems = [
      ...(data.officeAutomation ? data.officeAutomation.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
      ...(data.techKnowledge ? data.techKnowledge.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
    ];
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative flex flex-col overflow-hidden"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale }}
          >
            <WatermarkOverlay />
            <div className="relative shrink-0 flex items-center" style={{ backgroundColor: headerBg, minHeight: "88px", padding: "14px 20px 14px 0" }}>
              <div className="flex justify-center items-center shrink-0" style={{ width: "var(--resume-column-width, 32%)", flex: "0 0 var(--resume-column-width, 32%)" }}>
                {showPhoto ? (
                  <img src={data.photo} alt="Profile" className="rounded-full border-4 border-white shadow-md" style={{
                    width: photoPx, height: photoPx,
                    objectFit: "var(--resume-photo-fit, cover)",
                    objectPosition: "var(--resume-photo-position, center)",
                  }} crossOrigin="anonymous" />
                ) : (
                  <div className="rounded-full border-4 border-white/80 bg-white/20 flex items-center justify-center text-white text-2xl font-bold" style={{ width: photoPx, height: photoPx }}>
                    {(data.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <h1 className="text-[22px] font-black uppercase tracking-wide text-white leading-tight">{data.fullName || "YOUR NAME"}</h1>
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/80 mt-1 font-medium">Professional Resume</p>
              </div>
            </div>
            <div className="flex flex-1 min-h-0">
              <div className="px-3.5 py-4 flex flex-col text-[10px] shrink-0" style={{ width: "var(--resume-column-width, 32%)", flex: "0 0 var(--resume-column-width, 32%)", backgroundColor: sidebarBg, color: "#334155", gap: `calc(${sectionGapPx}px * var(--resume-fit-space, 1))`, boxSizing: "border-box" }}>
                <div>
                  <SidebarHeading>Contact</SidebarHeading>
                  <div className="space-y-2">
                    {data.phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-[11px] mt-0.5 shrink-0" style={{ color: primary }}>&#9742;</span>
                        <span className="leading-snug">{data.phone}</span>
                      </div>
                    )}
                    {data.email && (
                      <div className="flex items-start gap-2">
                        <span className="text-[11px] mt-0.5 shrink-0" style={{ color: primary }}>&#9993;</span>
                        <span className="leading-snug break-all">{data.email}</span>
                      </div>
                    )}
                    {data.address && (
                      <div className="flex items-start gap-2">
                        <span className="text-[11px] mt-0.5 shrink-0" style={{ color: primary }}>&#9906;</span>
                        <span className="leading-snug whitespace-pre-line">{data.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                {skillItems.length > 0 && (
                  <div>
                    <SidebarHeading>Skills</SidebarHeading>
                    <ul className="space-y-1">
                      {skillItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                          <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: primary }} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hobbiesList.length > 0 && (
                  <div>
                    <SidebarHeading>Interests</SidebarHeading>
                    <ul className="space-y-1">
                      {hobbiesList.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                          <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: primary }} />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="px-5 py-4 flex flex-col bg-white overflow-hidden flex-1 min-w-0">
                <div className={`${spacingClass} flex-1`}>
                  {data.summary && (
                    <div>
                      <ProSectionTitle icon="&#128100;">Profile</ProSectionTitle>
                      <p className="text-[10.5px] leading-relaxed text-slate-600 text-justify">
                        <RichText value={data.summary} />
                      </p>
                    </div>
                  )}
                  {data.workExperience && (
                    <div>
                      <ProSectionTitle icon="&#128188;">Work Experience</ProSectionTitle>
                      <div className="relative pl-4">
                        <div className="absolute left-[5px] top-1 bottom-1 w-[2px]" style={{ backgroundColor: "#cbd5e1" }} />
                        <div className="relative">
                          <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 bg-white" style={{ borderColor: headerBg }} />
                          <p className="text-[10.5px] leading-relaxed whitespace-pre-line text-slate-700">
                            <RichText value={data.workExperience} />
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {(data.gradCourse || data.interSchool || data.sscSchool) && (
                    <div>
                      <ProSectionTitle icon="&#127891;">Education</ProSectionTitle>
                      <div className="relative pl-4 space-y-2.5">
                        <div className="absolute left-[5px] top-1 bottom-1 w-[2px]" style={{ backgroundColor: "#cbd5e1" }} />
                        {data.gradCourse && (
                          <div className="relative">
                            <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 bg-white" style={{ borderColor: headerBg }} />
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">{data.gradCourse}</p>
                            <p className="text-[10px] text-slate-600">{[data.gradCollege, data.gradUniv].filter(Boolean).join(" | ")}</p>
                            {data.gradDiv && <p className="text-slate-500" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>Division / %: {data.gradDiv}</p>}
                          </div>
                        )}
                        {data.interSchool && (
                          <div className="relative">
                            <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 bg-white" style={{ borderColor: headerBg }} />
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">Intermediate (12th)</p>
                            <p className="text-[10px] text-slate-600">{[data.interSchool, data.interBoard].filter(Boolean).join(" | ")}</p>
                            {data.interDiv && <p className="text-slate-500" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>Division: {data.interDiv}</p>}
                          </div>
                        )}
                        {data.sscSchool && (
                          <div className="relative">
                            <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 bg-white" style={{ borderColor: headerBg }} />
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">SSC (10th)</p>
                            <p className="text-[10px] text-slate-600">{[data.sscSchool, data.sscBoard].filter(Boolean).join(" | ")}</p>
                            {data.sscDiv && <p className="text-slate-500" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>Division: {data.sscDiv}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {s.showSignature && <SignatureFooter />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- MODERN TEAL ----------
  if (template.layoutType === "modern-teal") {
    const accent = s.accentColor || "#0d9488";
    const headerBg = s.headerBg || "#e0f2fe";
    const primary = s.primaryColor || "#0f172a";
    const text = s.textColor || "#334155";

    const TealTitle = ({ children }) => (
      <div className="mb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primary }}>{children}</h3>
        <div className="h-[2.5px] mt-1 w-full max-w-[140px]" style={{ backgroundColor: accent }} />
      </div>
    );
    const skillItems = [
      ...(data.officeAutomation ? data.officeAutomation.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
      ...(data.techKnowledge ? data.techKnowledge.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
    ];
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative flex flex-col overflow-hidden"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, color: text }}
          >
            <WatermarkOverlay />
            <div className="relative shrink-0 flex items-end" style={{ backgroundColor: headerBg, minHeight: "110px" }}>
              <div className="flex justify-center pb-3 pt-4 shrink-0" style={{ width: "var(--resume-column-width, 34%)", flex: "0 0 var(--resume-column-width, 34%)" }}>
                {showPhoto ? (
                  <img src={data.photo} alt="Profile" className="rounded-full border-4 border-white shadow-md" style={{
                    width: photoPx, height: photoPx,
                    objectFit: "var(--resume-photo-fit, cover)",
                    objectPosition: "var(--resume-photo-position, center)",
                  }} crossOrigin="anonymous" />
                ) : (
                  <div className="rounded-full border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-white" style={{ width: photoPx, height: photoPx, backgroundColor: accent }}>
                    {(data.fullName || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 pb-4 pr-5">
                <h1 className="text-[26px] font-black leading-none tracking-tight" style={{ color: primary }}>
                  {(data.fullName || "YOUR NAME").split(" ").map((part, i) => (<span key={i} className="block">{part}</span>))}
                </h1>
              </div>
            </div>
            <div className="shrink-0 text-white text-[11px] font-semibold uppercase tracking-[0.15em] px-5 py-2" style={{ backgroundColor: accent }}>
              Professional Resume
            </div>
            <div className="flex flex-1 min-h-0">
              <div className="px-4 py-4 flex flex-col text-[10px] border-r border-slate-100 shrink-0" style={{ width: "var(--resume-column-width, 34%)", flex: "0 0 var(--resume-column-width, 34%)", gap: `calc(${sectionGapPx}px * var(--resume-fit-space, 1))`, boxSizing: "border-box" }}>
                <div>
                  <TealTitle>Contact</TealTitle>
                  <div className="space-y-1.5">
                    {data.email && (<div className="flex items-start gap-1.5"><span style={{ color: accent }}>✉</span><span className="break-all leading-snug">{data.email}</span></div>)}
                    {data.phone && (<div className="flex items-start gap-1.5"><span style={{ color: accent }}>☎</span><span className="leading-snug">{data.phone}</span></div>)}
                    {data.address && (<div className="flex items-start gap-1.5"><span style={{ color: accent }}>📍</span><span className="leading-snug whitespace-pre-line">{data.address}</span></div>)}
                  </div>
                </div>
                {data.summary && (
                  <div>
                    <TealTitle>Profile Summary</TealTitle>
                    <p className="leading-relaxed text-slate-600 text-justify"><RichText value={data.summary} /></p>
                  </div>
                )}
                {skillItems.length > 0 && (
                  <div>
                    <TealTitle>Skills</TealTitle>
                    <ul className="space-y-1">
                      {skillItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold" style={{ color: accent }}>✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hobbiesList.length > 0 && (
                  <div>
                    <TealTitle>Interests</TealTitle>
                    <ul className="space-y-1">
                      {hobbiesList.map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold" style={{ color: accent }}>✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="px-5 py-4 flex flex-col text-[10.5px] flex-1 min-w-0" style={{ gap: `calc(${sectionGapPx}px * var(--resume-fit-space, 1))` }}>
                {data.workExperience && (
                  <div>
                    <TealTitle>Professional Experience</TealTitle>
                    <p className="leading-relaxed whitespace-pre-line text-slate-700"><RichText value={data.workExperience} /></p>
                  </div>
                )}
                {(data.gradCourse || data.interSchool || data.sscSchool) && (
                  <div>
                    <TealTitle>Education</TealTitle>
                    <div className="space-y-2.5">
                      {data.gradCourse && (
                        <div>
                          <p className="font-bold uppercase text-[11px]" style={{ color: primary }}>{data.gradCourse}</p>
                          <p className="text-slate-600 text-[10px]">{[data.gradCollege, data.gradUniv].filter(Boolean).join(" | ")}</p>
                          {data.gradDiv && <p className="text-slate-500 text-[9.5px]">Division / %: {data.gradDiv}</p>}
                        </div>
                      )}
                      {data.interSchool && (
                        <div>
                          <p className="font-bold uppercase text-[11px]" style={{ color: primary }}>Intermediate (12th)</p>
                          <p className="text-slate-600 text-[10px]">{[data.interSchool, data.interBoard].filter(Boolean).join(" | ")}</p>
                          {data.interDiv && <p className="text-slate-500 text-[9.5px]">Division: {data.interDiv}</p>}
                        </div>
                      )}
                      {data.sscSchool && (
                        <div>
                          <p className="font-bold uppercase text-[11px]" style={{ color: primary }}>SSC (10th)</p>
                          <p className="text-slate-600 text-[10px]">{[data.sscSchool, data.sscBoard].filter(Boolean).join(" | ")}</p>
                          {data.sscDiv && <p className="text-slate-500 text-[9.5px]">Division: {data.sscDiv}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- PURPLE SPLIT ----------
  if (template.layoutType === "purple-split") {
    const purple = s.headerBg || "#bfa0d8";
    const purpleDeep = s.accentColor || "#72479e";
    const purpleSoft = s.sectionBg || "#e9e0f3";
    const ink = s.primaryColor || "#2b2338";
    const muted = s.secondaryColor || "#554e5e";
    const initials = (data.fullName || "U").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toLowerCase();
    const skillItems = [
      ...(data.officeAutomation ? data.officeAutomation.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
      ...(data.techKnowledge ? data.techKnowledge.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
    ];
    const RatingDots = ({ filled = 4, total = 5 }) => (
      <div className="flex gap-[5px] mt-1">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className="inline-block rounded-full" style={{ width: 10, height: 10, backgroundColor: i < filled ? purpleDeep : "#d2c8dd" }} />
        ))}
      </div>
    );
    const IconCircle = ({ children }) => (
      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>{children}</div>
    );
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="mx-auto relative overflow-hidden"
            style={{
              ...a4Style,
              "--resume-font-scale": autoFontScale,
              fontFamily: "'Courier New', Courier, monospace",
              color: muted,
              backgroundColor: "#ffffff",
            }}
          >
            <WatermarkOverlay />
            <div className="grid h-full" style={{ gridTemplateColumns: "32% 1fr", gridTemplateRows: "auto 1fr", minHeight: "100%" }}>
              <div className="flex flex-col" style={{ gridRow: "1 / 3" }}>
                <div style={{ backgroundColor: purple, padding: "28px 22px 24px", color: ink }}>
                  <div className="mb-4 flex justify-start">
                    <div className="flex items-center justify-center text-white italic" style={{
                      width: photoPx, height: Math.round(photoPx * 64 / 56), backgroundColor: purpleDeep,
                      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                      fontFamily: "Georgia, Times New Roman, serif", fontSize: 18, letterSpacing: "-1px",
                    }}>{initials || "cv"}</div>
                  </div>
                  <h1 className="uppercase font-extrabold leading-tight mb-2" style={{
                    fontFamily: "system-ui, Segoe UI, Roboto, sans-serif",
                    fontSize: "calc(22px * var(--resume-font-scale, 1))",
                    color: "#2e2638", letterSpacing: "0.5px",
                  }}>
                    {(data.fullName || "YOUR NAME").split(/\s+/).map((part, i) => (<span key={i} className="block">{part}</span>))}
                  </h1>
                  <div className="mb-5" style={{ width: 40, height: 2, backgroundColor: "#635073" }} />
                  <div className="flex flex-col gap-3" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", color: "#433950" }}>
                    {data.email && (
                      <div className="flex items-center gap-2.5">
                        <IconCircle><svg viewBox="0 0 24 24" width="12" height="12" fill="#2b2338"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg></IconCircle>
                        <span className="break-all leading-snug">{data.email}</span>
                      </div>
                    )}
                    {data.phone && (
                      <div className="flex items-center gap-2.5">
                        <IconCircle><svg viewBox="0 0 24 24" width="12" height="12" fill="#2b2338"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></IconCircle>
                        <span>{data.phone}</span>
                      </div>
                    )}
                    {data.address && (
                      <div className="flex items-center gap-2.5">
                        <IconCircle><svg viewBox="0 0 24 24" width="12" height="12" fill="#2b2338"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></IconCircle>
                        <span className="leading-snug whitespace-pre-line">{data.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col flex-1" style={{ backgroundColor: purpleSoft, padding: "24px 22px", gap: `calc(${sectionGapPx}px * var(--resume-fit-space, 1))` }}>
                  {(data.gradCourse || data.interSchool || data.sscSchool) && (
                    <div>
                      <h2 className="uppercase font-bold tracking-wide mb-3" style={{ fontFamily: "system-ui, Segoe UI, Roboto, sans-serif", fontSize: "calc(13px * var(--resume-font-scale, 1))", color: ink, letterSpacing: "1px" }}>Education</h2>
                      {data.gradCourse && (
                        <div className="mb-3" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", lineHeight: 1.4, color: "#4a4453" }}>
                          <div className="font-bold" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))", color: ink }}>{data.gradCollege || data.gradUniv || "College"}</div>
                          {(data.gradUniv || data.gradDiv) && (<div className="italic mt-0.5 mb-1" style={{ color: "#6b6375" }}>{[data.gradUniv, data.gradDiv].filter(Boolean).join(" • ")}</div>)}
                          <div className="font-bold" style={{ color: "#3b3345" }}>{data.gradCourse}</div>
                        </div>
                      )}
                      {data.interSchool && (
                        <div className="mb-3" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", lineHeight: 1.4, color: "#4a4453" }}>
                          <div className="font-bold" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))", color: ink }}>{data.interSchool}</div>
                          <div className="italic mt-0.5 mb-1" style={{ color: "#6b6375" }}>{[data.interBoard, data.interDiv].filter(Boolean).join(" • ")}</div>
                          <div className="font-bold" style={{ color: "#3b3345" }}>Intermediate (12th)</div>
                        </div>
                      )}
                      {data.sscSchool && (
                        <div className="mb-3" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", lineHeight: 1.4, color: "#4a4453" }}>
                          <div className="font-bold" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))", color: ink }}>{data.sscSchool}</div>
                          <div className="italic mt-0.5 mb-1" style={{ color: "#6b6375" }}>{[data.sscBoard, data.sscDiv].filter(Boolean).join(" • ")}</div>
                          <div className="font-bold" style={{ color: "#3b3345" }}>SSC (10th)</div>
                        </div>
                      )}
                    </div>
                  )}
                  {skillItems.length > 0 && (
                    <div>
                      <h2 className="uppercase font-bold tracking-wide mb-3" style={{ fontFamily: "system-ui, Segoe UI, Roboto, sans-serif", fontSize: "calc(13px * var(--resume-font-scale, 1))", color: ink, letterSpacing: "1px" }}>Skills</h2>
                      {skillItems.map((sk, i) => (
                        <div key={i} className="mb-2.5" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", color: "#4a4453" }}>
                          <div className="mb-1">{sk}</div>
                          <RatingDots filled={4} total={5} />
                        </div>
                      ))}
                    </div>
                  )}
                  {hobbiesList.length > 0 && (
                    <div>
                      <h2 className="uppercase font-bold tracking-wide mb-3" style={{ fontFamily: "system-ui, Segoe UI, Roboto, sans-serif", fontSize: "calc(13px * var(--resume-font-scale, 1))", color: ink, letterSpacing: "1px" }}>Interests</h2>
                      {hobbiesList.map((h, i) => (
                        <div key={i} className="mb-1.5" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", color: "#4a4453" }}>{h}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col min-h-0">
                <div style={{ backgroundColor: "#f7f3f9", padding: "28px 32px 24px" }}>
                  <h2 className="uppercase font-bold tracking-wide mb-3" style={{ fontFamily: "system-ui, Segoe UI, Roboto, sans-serif", fontSize: "calc(13px * var(--resume-font-scale, 1))", color: ink, letterSpacing: "1px" }}>Resume Objective</h2>
                  {data.summary && (<p className="leading-relaxed" style={{ fontSize: "calc(11.5px * var(--resume-font-scale, 1))", lineHeight: 1.6, color: muted }}><RichText value={data.summary} /></p>)}
                </div>
                <div className="flex flex-col flex-1 bg-white" style={{ padding: "24px 32px", gap: `calc(${sectionGapPx}px * var(--resume-fit-space, 1))` }}>
                  {data.workExperience && (
                    <div>
                      <h2 className="uppercase font-bold tracking-wide mb-3" style={{ fontFamily: "system-ui, Segoe UI, Roboto, sans-serif", fontSize: "calc(13px * var(--resume-font-scale, 1))", color: ink, letterSpacing: "1px" }}>Work Experience</h2>
                      <p className="whitespace-pre-line leading-relaxed" style={{ fontSize: "calc(11.5px * var(--resume-font-scale, 1))", lineHeight: 1.55, color: muted }}><RichText value={data.workExperience} /></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- INDIAN FORMAL ----------
  if (template.layoutType === "indian-formal") {
    const orange = s.accentColor || s.primaryColor || "#d84a26";
    const InfoRow = ({ label, value }) => {
      if (!value) return null;
      return (
        <tr>
          <td style={{ padding: "5px 0", fontSize: "calc(12px * var(--resume-font-scale, 1))", width: "38%", verticalAlign: "top" }}>{label}</td>
          <td style={{ padding: "5px 0", fontSize: "calc(12px * var(--resume-font-scale, 1))", width: "6%", textAlign: "center", verticalAlign: "top" }}>:</td>
          <td style={{ padding: "5px 0", fontSize: "calc(12px * var(--resume-font-scale, 1))", width: "56%", verticalAlign: "top" }}>{value}</td>
        </tr>
      );
    };
    const academicRows = [];
    if (data.sscSchool || data.sscBoard || data.sscDiv) academicRows.push({ exam: "HIGH SCHOOL (10th)", year: data.sscBoard || "—", mark: data.sscDiv || "—" });
    if (data.interSchool || data.interBoard || data.interDiv) academicRows.push({ exam: "INTERMEDIATE (12th)", year: data.interBoard || "—", mark: data.interDiv || "—" });
    if (data.gradCourse || data.gradCollege || data.gradDiv) academicRows.push({ exam: (data.gradCourse || "GRADUATION").toUpperCase(), year: data.gradUniv || data.gradCollege || "—", mark: data.gradDiv || "—" });
    const cornerStyle = (extra) => ({ position: "absolute", width: 40, height: 40, border: `2px solid ${orange}`, ...extra });
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="mx-auto relative bg-white overflow-hidden"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
          >
            <WatermarkOverlay />
            <div className="relative h-full box-border flex flex-col" style={{
              border: `3px double ${orange}`,
              outline: `2px solid ${orange}`,
              outlineOffset: "-8px",
              padding: "12px 14px 10px",
              minHeight: "100%",
            }}>
              <div style={cornerStyle({ top: 4, left: 4, borderRight: "none", borderBottom: "none" })} />
              <div style={cornerStyle({ top: 4, right: 4, borderLeft: "none", borderBottom: "none" })} />
              <div style={cornerStyle({ bottom: 4, left: 4, borderRight: "none", borderTop: "none" })} />
              <div style={cornerStyle({ bottom: 4, right: 4, borderLeft: "none", borderTop: "none" })} />
              <h1 className="text-center font-bold uppercase" style={{ color: orange, fontSize: "calc(20px * var(--resume-font-scale, 1))", textDecoration: "underline", letterSpacing: "2px", marginBottom: 16 }}>Resume</h1>
              <div className="flex justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <InfoRow label="Name" value={data.fullName} />
                      <InfoRow label="Contact Number" value={data.phone} />
                      <InfoRow label="Email Id" value={data.email} />
                      <InfoRow label="Permanent Address" value={data.address} />
                      <InfoRow label="Qualification" value={data.gradCourse} />
                      <InfoRow label="Language Know" value={hobbiesList.length ? hobbiesList.join(" / ") : data.hobbies} />
                    </tbody>
                  </table>
                </div>
                <div className="shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center" style={{ width: photoPx, height: Math.round(photoPx * 1.18), border: "1px solid #000" }}>
                  {showPhoto ? (
                    <img src={data.photo} alt="Photo" style={{
                      width: "100%", height: "100%",
                      objectFit: "var(--resume-photo-fit, cover)",
                      objectPosition: "var(--resume-photo-position, center)",
                    }} crossOrigin="anonymous" />
                  ) : (<span style={{ fontSize: 11, color: "#999" }}>Photo</span>)}
                </div>
              </div>
              <div className="font-bold uppercase" style={{ color: orange, fontSize: "calc(13px * var(--resume-font-scale, 1))", marginTop: 10, marginBottom: 8 }}>Academic Details</div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12, fontSize: "calc(12px * var(--resume-font-scale, 1))" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "4px 6px", color: orange, width: "10%" }}>Sr.</th>
                    <th style={{ textAlign: "left", padding: "4px 6px", color: orange, width: "35%" }}>Examination</th>
                    <th style={{ textAlign: "left", padding: "4px 6px", color: orange, width: "30%" }}>Board / Univ</th>
                    <th style={{ textAlign: "left", padding: "4px 6px", color: orange, width: "25%" }}>Mark / Div</th>
                  </tr>
                </thead>
                <tbody>
                  {academicRows.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: "4px 6px", color: "#666" }}>—</td></tr>
                  ) : (
                    academicRows.map((row, i) => (
                      <tr key={i}>
                        <td style={{ padding: "4px 6px" }}>{i + 1}</td>
                        <td style={{ padding: "4px 6px" }}>{row.exam}</td>
                        <td style={{ padding: "4px 6px" }}>{row.year}</td>
                        <td style={{ padding: "4px 6px" }}>{row.mark}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {data.workExperience && (
                <div style={{ marginTop: 10, marginBottom: 6 }}>
                  <span className="font-bold" style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))" }}>Experience: </span>
                  <span style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))", whiteSpace: "pre-line" }}>
                    <RichText value={data.workExperience} />
                  </span>
                </div>
              )}
              {(data.officeAutomation || data.techKnowledge) && (
                <div style={{ marginTop: 8, marginBottom: 6, fontSize: "calc(12.5px * var(--resume-font-scale, 1))" }}>
                  {data.officeAutomation && (<div><span className="font-bold">Office Automation: </span>{data.officeAutomation}</div>)}
                  {data.techKnowledge && (<div><span className="font-bold">Technical Knowledge: </span>{data.techKnowledge}</div>)}
                </div>
              )}
              {data.summary && (
                <div style={{ marginTop: 10 }}>
                  <div className="font-bold" style={{ fontSize: "calc(12.5px * var(--resume-font-scale, 1))", marginBottom: 4 }}>Career Objective:</div>
                  <div style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))", lineHeight: 1.45, marginBottom: 20 }}>
                    <RichText value={data.summary} />
                  </div>
                </div>
              )}
              <div className="flex justify-between mt-auto" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))", paddingTop: 16 }}>
                <div style={{ lineHeight: 2 }}>
                  <div>PLACE</div>
                  <div>DATE-</div>
                </div>
                <div className="text-right self-end">
                  <div style={{ marginBottom: 28 }} />
                  <div>Signature</div>
                  {data.fullName && (<div className="font-bold" style={{ marginTop: 2 }}>({data.fullName})</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- MODERN SLATE ----------
  if (template.layoutType === "modern-slate") {
    const slate = s.accentColor || "#8b9eb7";
    const dark = s.primaryColor || "#121517";
    const bgSoft = s.sectionBg || "#f6f8fd";
    const text = s.textColor || "#333333";
    const muted = s.secondaryColor || "#4b5563";
    const nameParts = (data.fullName || "Your Name").trim().split(/\s+/);
    const firstName = nameParts[0] || "Your";
    const lastName = nameParts.slice(1).join(" ") || "Name";
    const SectionTitleLocal = ({ children }) => (
      <div className="uppercase font-bold tracking-wide mb-2.5" style={{ color: slate, fontSize: "calc(15px * var(--resume-font-scale, 1))", letterSpacing: "1.5px" }}>{children}</div>
    );
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="mx-auto relative overflow-hidden flex flex-col"
            style={{
              ...a4Style,
              "--resume-font-scale": autoFontScale,
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              color: text, backgroundColor: bgSoft,
            }}
          >
            <WatermarkOverlay />
            <div className="flex shrink-0" style={{ minHeight: 280 }}>
              <div className="w-1/2 flex flex-col items-center relative" style={{ backgroundColor: slate }}>
                <div className="rounded-full overflow-hidden bg-gray-300 shrink-0" style={{
                  width: photoPx, height: photoPx, border: "6px solid #ffffff",
                  marginTop: 18, position: "relative", zIndex: 20, isolation: "isolate", flex: "0 0 auto",
                }}>
                  {showPhoto ? (
                    <img src={data.photo} alt="Profile" style={{
                      width: "100%", height: "100%",
                      objectFit: "var(--resume-photo-fit, cover)",
                      objectPosition: "var(--resume-photo-position, center)",
                    }} crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: dark }}>
                      {(firstName[0] || "U").toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="w-full text-center text-white" style={{
                  position: "relative", zIndex: 10, backgroundColor: dark,
                  marginTop: -70, paddingTop: 82, paddingBottom: 28,
                  clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)",
                }}>
                  <div style={{ fontSize: "calc(22px * var(--resume-font-scale, 1))", fontWeight: 400, lineHeight: 1.1, letterSpacing: "0.5px" }}>{firstName}</div>
                  <div style={{ fontSize: "calc(22px * var(--resume-font-scale, 1))", fontWeight: 500, lineHeight: 1.1, marginBottom: 6 }}>{lastName}</div>
                  {data.gradCourse && (<div style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", color: "#d1d5db", fontWeight: 300 }}>{data.gradCourse}</div>)}
                </div>
              </div>
              <div className="w-1/2" style={{ backgroundColor: bgSoft, padding: "22px 20px 16px" }}>
                {data.summary && (
                  <div className="mb-4">
                    <SectionTitleLocal>Profile</SectionTitleLocal>
                    <p className="text-justify leading-relaxed" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", lineHeight: 1.45, color: text }}>
                      <RichText value={data.summary} />
                    </p>
                  </div>
                )}
                <SectionTitleLocal>Contact</SectionTitleLocal>
                <div className="flex flex-col gap-2" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", color: text }}>
                  {data.phone && <div>{data.phone}</div>}
                  {data.email && <div className="break-all">{data.email}</div>}
                  {data.address && (<div className="whitespace-pre-line leading-snug">{data.address}</div>)}
                </div>
              </div>
            </div>
            <div className="flex-1" style={{ padding: "20px 24px 16px" }}>
              {data.workExperience && (
                <div className="mb-4">
                  <SectionTitleLocal>Experience</SectionTitleLocal>
                  <div className="relative" style={{ marginTop: 8, paddingLeft: 4 }}>
                    <div className="absolute" style={{ left: 58, top: 6, bottom: 6, width: 1, backgroundColor: slate }} />
                    <div className="relative flex">
                      <div className="absolute rounded-full" style={{ left: 55, top: 4, width: 7, height: 7, backgroundColor: slate }} />
                      <div className="flex-1 pl-20">
                        <p className="whitespace-pre-line leading-relaxed" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", lineHeight: 1.45, color: muted }}>
                          <RichText value={data.workExperience} />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {(data.gradCourse || data.interSchool || data.sscSchool) && (
                <div className="mb-3">
                  <SectionTitleLocal>Education</SectionTitleLocal>
                  <div className="space-y-1.5" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", color: muted }}>
                    {data.gradCourse && (
                      <div>
                        <span className="font-semibold" style={{ color: text }}>{data.gradCourse}</span>
                        {(data.gradCollege || data.gradUniv || data.gradDiv) && (
                          <span> — {[data.gradCollege, data.gradUniv, data.gradDiv].filter(Boolean).join(" | ")}</span>
                        )}
                      </div>
                    )}
                    {data.interSchool && (
                      <div>
                        <span className="font-semibold" style={{ color: text }}>Intermediate (12th)</span>
                        {" — "}
                        {[data.interSchool, data.interBoard, data.interDiv].filter(Boolean).join(" | ")}
                      </div>
                    )}
                    {data.sscSchool && (
                      <div>
                        <span className="font-semibold" style={{ color: text }}>SSC (10th)</span>
                        {" — "}
                        {[data.sscSchool, data.sscBoard, data.sscDiv].filter(Boolean).join(" | ")}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {(data.officeAutomation || data.techKnowledge || hobbiesList.length > 0) && (
                <div>
                  <SectionTitleLocal>Skills</SectionTitleLocal>
                  <div style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))", color: muted, lineHeight: 1.5 }}>
                    {data.officeAutomation && <div>{data.officeAutomation}</div>}
                    {data.techKnowledge && <div>{data.techKnowledge}</div>}
                    {hobbiesList.length > 0 && <div>{hobbiesList.join(" · ")}</div>}
                  </div>
                </div>
              )}
            </div>
            <div className="shrink-0 w-full" style={{ height: 14, backgroundColor: slate }} />
          </div>
        </div>
      </div>
    );
  }

  // ---------- TEAL BANNER ----------
  if (template.layoutType === "teal-banner") {
    const teal = s.accentColor || s.primaryColor || "#008080";
    const Banner = ({ children }) => (
      <div className="text-center font-bold uppercase text-white" style={{
        backgroundColor: teal, fontSize: "calc(13px * var(--resume-font-scale, 1))",
        padding: "4px 0", marginTop: 8, marginBottom: 6, letterSpacing: "0.5px",
      }}>{children}</div>
    );
    const skillItems = [
      ...(data.officeAutomation ? data.officeAutomation.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
      ...(data.techKnowledge ? data.techKnowledge.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
    ];
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="mx-auto relative bg-white overflow-hidden"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
          >
            <WatermarkOverlay />
            <div className="flex flex-col h-full" style={{ padding: "2px 0" }}>
              <div className="text-center font-bold uppercase" style={{
                color: teal, fontSize: "calc(18px * var(--resume-font-scale, 1))",
                textDecoration: "underline", marginBottom: 12, letterSpacing: "0.5px",
              }}>{data.fullName || "YOUR NAME"}</div>
              <div className="flex justify-between items-start gap-4 mb-3">
                <div style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))", lineHeight: 1.5 }}>
                  {data.email && (<div><strong>Email id:</strong> <span style={{ textDecoration: "underline" }}>{data.email}</span></div>)}
                  {data.phone && (<div><strong>Mobile No:</strong> {data.phone}</div>)}
                  {data.address && (<div><strong>Address:</strong> <span className="whitespace-pre-line">{data.address}</span></div>)}
                </div>
                <div className="shrink-0 bg-white overflow-hidden flex items-center justify-center" style={{
                  width: photoPx, height: Math.round(photoPx * 122 / 100), border: `1px solid ${teal}`, padding: 3,
                }}>
                  {showPhoto ? (
                    <img src={data.photo} alt="Photo" style={{
                      width: "100%", height: "100%",
                      objectFit: "var(--resume-photo-fit, cover)",
                      objectPosition: "var(--resume-photo-position, center)",
                    }} crossOrigin="anonymous" />
                  ) : (<span style={{ fontSize: 11, color: "#999" }}>Photo</span>)}
                </div>
              </div>
              {data.summary && (
                <>
                  <Banner>Career Objective</Banner>
                  <ul style={{ paddingLeft: 28, marginBottom: 6, fontSize: "calc(12px * var(--resume-font-scale, 1))", lineHeight: 1.45 }}>
                    <li><RichText value={data.summary} /></li>
                  </ul>
                </>
              )}
              {(data.gradCourse || data.interSchool || data.sscSchool) && (
                <>
                  <Banner>Academic Qualification</Banner>
                  <ul style={{ paddingLeft: 28, marginBottom: 6, fontSize: "calc(12px * var(--resume-font-scale, 1))", lineHeight: 1.5 }}>
                    {data.gradCourse && (<li>{[data.gradCourse, data.gradCollege, data.gradUniv, data.gradDiv].filter(Boolean).join(", ")}</li>)}
                    {data.interSchool && (<li>Intermediate — {[data.interSchool, data.interBoard, data.interDiv].filter(Boolean).join(", ")}</li>)}
                    {data.sscSchool && (<li>10th Class — {[data.sscSchool, data.sscBoard, data.sscDiv].filter(Boolean).join(", ")}</li>)}
                  </ul>
                </>
              )}
              {skillItems.length > 0 && (
                <>
                  <Banner>Professional Skills</Banner>
                  <ul style={{ paddingLeft: 28, marginBottom: 6, fontSize: "calc(12px * var(--resume-font-scale, 1))", lineHeight: 1.45 }}>
                    {skillItems.map((sk, i) => (<li key={i}>{sk}</li>))}
                  </ul>
                </>
              )}
              {hobbiesList.length > 0 && (
                <>
                  <Banner>Strengths / Hobbies</Banner>
                  <ul style={{ paddingLeft: 28, marginBottom: 6, fontSize: "calc(12px * var(--resume-font-scale, 1))", lineHeight: 1.45 }}>
                    {hobbiesList.map((h, i) => (<li key={i}>{h}</li>))}
                  </ul>
                </>
              )}
              <Banner>Work Experience</Banner>
              <ul style={{ paddingLeft: 28, marginBottom: 6, fontSize: "calc(12px * var(--resume-font-scale, 1))", lineHeight: 1.45 }}>
                <li className="whitespace-pre-line">
                  {data.workExperience ? <RichText value={data.workExperience} /> : "Fresher"}
                </li>
              </ul>
              <Banner>Personal Details</Banner>
              <table style={{ width: "100%", marginBottom: 16, fontSize: "calc(12px * var(--resume-font-scale, 1))", borderCollapse: "collapse" }}>
                <tbody>
                  {data.fullName && (<tr><td style={{ width: 130, padding: "2px 0" }}>Name</td><td style={{ width: 20, textAlign: "center" }}>:</td><td style={{ padding: "2px 0" }}>{data.fullName}</td></tr>)}
                  {data.address && (<tr><td style={{ padding: "2px 0", verticalAlign: "top" }}>Address</td><td style={{ textAlign: "center", verticalAlign: "top" }}>:</td><td style={{ padding: "2px 0" }} className="whitespace-pre-line">{data.address}</td></tr>)}
                  {data.phone && (<tr><td style={{ padding: "2px 0" }}>Mobile</td><td style={{ textAlign: "center" }}>:</td><td style={{ padding: "2px 0" }}>{data.phone}</td></tr>)}
                  {data.email && (<tr><td style={{ padding: "2px 0" }}>Email</td><td style={{ textAlign: "center" }}>:</td><td style={{ padding: "2px 0" }}>{data.email}</td></tr>)}
                  {hobbiesList.length > 0 && (<tr><td style={{ padding: "2px 0" }}>Hobbies</td><td style={{ textAlign: "center" }}>:</td><td style={{ padding: "2px 0" }}>{hobbiesList.join(", ")}</td></tr>)}
                </tbody>
              </table>
              <div className="flex justify-between mt-auto" style={{ fontSize: "calc(12px * var(--resume-font-scale, 1))", paddingTop: 12 }}>
                <div style={{ lineHeight: 1.8 }}>
                  <div>Place:</div>
                  <div>Date:</div>
                </div>
                <div className="self-end font-semibold">{data.fullName || "Signature"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- IMPORTED ----------
  if (template.layoutType?.startsWith("imported-")) {
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <ImportedTemplateRenderer
            layoutType={template.layoutType}
            data={data}
            styles={s}
            a4Style={a4Style}
            fontScale={autoFontScale}
            photoSize={photoPx}
            showPhoto={Boolean(showPhoto)}
            resumeDocRef={resumeDocRef}
          />
        </div>
      </div>
    );
  }

  // ---------- NEW PROFESSIONAL LAYOUTS ----------
  const skillItemsAll = [
    ...(data.officeAutomation ? data.officeAutomation.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
    ...(data.techKnowledge ? data.techKnowledge.split(/[,•|]/).map((x) => x.trim()).filter(Boolean) : []),
  ];

  if (template.layoutType === "richard-pro") {
    const primary = s.primaryColor || "#1e2d42";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative overflow-hidden"
            style={{
              ...a4Style,
              "--resume-font-scale": autoFontScale,
              fontFamily: s.fontFamily,
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: "20px",
            }}
          >
            <WatermarkOverlay />
            <div className="col-span-2 flex items-center gap-6 border-b-2 border-gray-100 pb-4">
              {showPhoto && (
                <img src={data.photo} alt="Profile" className="rounded-full border-4 shrink-0" style={{
                  width: photoPx || 110, height: photoPx || 110, borderColor: primary,
                  objectFit: "var(--resume-photo-fit, cover)",
                  objectPosition: "var(--resume-photo-position, center)",
                }} crossOrigin="anonymous" />
              )}
              <div>
                <h1 className="font-bold tracking-widest uppercase" style={{ color: primary, fontSize: "calc(26px * var(--resume-font-scale, 1))" }}>{data.fullName || "YOUR NAME"}</h1>
                <p className="text-[15px] text-gray-500 mt-1">Professional Resume</p>
              </div>
            </div>
            <div className="border-r border-gray-200 pr-4 space-y-4" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div>
                <div className="text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 mb-2" style={{ backgroundColor: primary }}>About Me</div>
                <p className="text-gray-600 leading-relaxed"><RichText value={data.summary || "Professional summary goes here."} /></p>
              </div>
              <div>
                <div className="text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 mb-2" style={{ backgroundColor: primary }}>Contact</div>
                {data.phone && <p className="mb-1.5 text-gray-600">📞 {data.phone}</p>}
                {data.email && <p className="mb-1.5 text-gray-600 break-all">✉️ {data.email}</p>}
                {data.address && <p className="mb-1.5 text-gray-600 whitespace-pre-line">📍 {data.address}</p>}
              </div>
              {hobbiesList.length > 0 && (
                <div>
                  <div className="text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 mb-2" style={{ backgroundColor: primary }}>Interests</div>
                  {hobbiesList.map((h, i) => (<p key={i} className="mb-1 text-gray-600">• {h}</p>))}
                </div>
              )}
              {skillItemsAll.length > 0 && (
                <div>
                  <div className="text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 mb-2" style={{ backgroundColor: primary }}>Expertise</div>
                  {skillItemsAll.slice(0, 6).map((sk, i) => (<p key={i} className="mb-1 text-gray-600">• {sk}</p>))}
                </div>
              )}
            </div>
            <div className="space-y-4" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              {data.workExperience && (
                <div>
                  <div className="text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 mb-2" style={{ backgroundColor: primary }}>Experience</div>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line"><RichText value={data.workExperience} /></div>
                </div>
              )}
              {(data.gradCourse || data.interSchool || data.sscSchool) && (
                <div>
                  <div className="text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 mb-2" style={{ backgroundColor: primary }}>Education</div>
                  {data.gradCourse && (
                    <div className="mb-2">
                      <p className="font-bold" style={{ color: primary }}>{data.gradCourse}</p>
                      <p className="text-gray-500 text-[10px]">{[data.gradCollege, data.gradUniv, data.gradDiv].filter(Boolean).join(" | ")}</p>
                    </div>
                  )}
                  {data.interSchool && (
                    <div className="mb-2">
                      <p className="font-bold" style={{ color: primary }}>Intermediate</p>
                      <p className="text-gray-500 text-[10px]">{[data.interSchool, data.interBoard, data.interDiv].filter(Boolean).join(" | ")}</p>
                    </div>
                  )}
                  {data.sscSchool && (
                    <div>
                      <p className="font-bold" style={{ color: primary }}>SSC / High School</p>
                      <p className="text-gray-500 text-[10px]">{[data.sscSchool, data.sscBoard, data.sscDiv].filter(Boolean).join(" | ")}</p>
                    </div>
                  )}
                </div>
              )}
              {skillItemsAll.length > 0 && (
                <div>
                  <div className="text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 mb-2" style={{ backgroundColor: primary }}>Skills Summary</div>
                  {skillItemsAll.slice(0, 4).map((sk, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-[10px] mb-0.5"><span>{sk}</span><span>{70 + (i % 3) * 5}%</span></div>
                      <div className="h-2 bg-gray-200 rounded overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${70 + (i % 3) * 5}%`, backgroundColor: primary }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.layoutType === "claire-pro") {
    const primary = s.primaryColor || "#4B3880";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative overflow-hidden"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: s.fontFamily }}
          >
            <WatermarkOverlay />
            <div className="grid grid-cols-[140px_1fr] gap-5 mb-5">
              {showPhoto ? (
                <img src={data.photo} alt="Profile" className="rounded-full" style={{
                  width: photoPx || 110, height: photoPx || 110,
                  objectFit: "var(--resume-photo-fit, cover)",
                  objectPosition: "var(--resume-photo-position, center)",
                }} crossOrigin="anonymous" />
              ) : (<div className="rounded-full bg-gray-200" style={{ width: 110, height: 110 }} />)}
              <div className="text-white p-4 rounded" style={{ backgroundColor: primary }}>
                <h1 className="text-[22px] font-bold">{data.fullName || "YOUR NAME"}</h1>
                <p className="text-[13px] text-white/80 mt-1">Professional Resume</p>
                <p className="text-[11px] mt-2 leading-relaxed opacity-90 line-clamp-3"><RichText value={data.summary || ""} /></p>
              </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] gap-6" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div>
                <div className="space-y-1.5 mb-4 text-gray-600">
                  {data.email && <p>✉️ {data.email}</p>}
                  {data.phone && <p>📞 {data.phone}</p>}
                  {data.address && <p className="whitespace-pre-line">📍 {data.address}</p>}
                </div>
                {skillItemsAll.length > 0 && (
                  <div>
                    <div className="font-bold uppercase text-[12px] border-b-2 pb-1 mb-2" style={{ color: primary, borderColor: primary }}>Soft Skills</div>
                    {skillItemsAll.slice(0, 5).map((sk, i) => (<p key={i} className="mb-1 text-gray-600">{sk}</p>))}
                  </div>
                )}
                {hobbiesList.length > 0 && (
                  <div className="mt-4">
                    <div className="font-bold uppercase text-[12px] border-b-2 pb-1 mb-2" style={{ color: primary, borderColor: primary }}>Interests</div>
                    {hobbiesList.map((h, i) => (
                      <div key={i} className="rounded px-2 py-1.5 text-center text-[11px] mb-1.5 font-medium" style={{ backgroundColor: s.sectionBg || "#f0ecf7", color: primary }}>{h}</div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                {(data.gradCourse || data.interSchool) && (
                  <div className="mb-4">
                    <div className="font-bold uppercase text-[12px] border-b-2 pb-1 mb-2" style={{ color: primary, borderColor: primary }}>Education</div>
                    {data.gradCourse && (
                      <div className="mb-2">
                        <p className="font-bold text-gray-800">{data.gradCourse}</p>
                        <p className="text-gray-500 italic text-[10px]">{[data.gradCollege, data.gradUniv, data.gradDiv].filter(Boolean).join(" | ")}</p>
                      </div>
                    )}
                    {data.interSchool && (
                      <div className="mb-2">
                        <p className="font-bold text-gray-800">Intermediate</p>
                        <p className="text-gray-500 italic text-[10px]">{[data.interSchool, data.interBoard].filter(Boolean).join(" | ")}</p>
                      </div>
                    )}
                  </div>
                )}
                {data.workExperience && (
                  <div>
                    <div className="font-bold uppercase text-[12px] border-b-2 pb-1 mb-2" style={{ color: primary, borderColor: primary }}>Experience</div>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line"><RichText value={data.workExperience} /></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.layoutType === "isabel-pro") {
    const primary = s.primaryColor || "#2f2f2f";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative overflow-hidden grid"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: s.fontFamily, gridTemplateColumns: "260px 1fr" }}
          >
            <WatermarkOverlay />
            <div className="text-white p-6 space-y-5" style={{ backgroundColor: primary, fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div className="text-center">
                {showPhoto ? (
                  <img src={data.photo} alt="Profile" className="rounded-full border-4 border-white mx-auto" style={{
                    width: photoPx || 120, height: photoPx || 120,
                    objectFit: "var(--resume-photo-fit, cover)",
                    objectPosition: "var(--resume-photo-position, center)",
                  }} crossOrigin="anonymous" />
                ) : (<div className="rounded-full bg-white/20 mx-auto" style={{ width: 120, height: 120 }} />)}
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider border-b border-white/30 pb-1 mb-2">About Me</div>
                <p className="text-white/80 leading-relaxed text-[11px]"><RichText value={data.summary || ""} /></p>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider border-b border-white/30 pb-1 mb-2">Contact</div>
                {data.phone && <p className="text-white/80 mb-1">📞 {data.phone}</p>}
                {data.email && <p className="text-white/80 mb-1 break-all">✉️ {data.email}</p>}
                {data.address && <p className="text-white/80 whitespace-pre-line">📍 {data.address}</p>}
              </div>
              {skillItemsAll.length > 0 && (
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wider border-b border-white/30 pb-1 mb-2">Skills</div>
                  {skillItemsAll.map((sk, i) => (<p key={i} className="text-white/80 mb-1">• {sk}</p>))}
                </div>
              )}
            </div>
            <div className="p-8" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div className="mb-6">
                <h1 className="font-bold uppercase leading-tight" style={{ color: primary, fontSize: "calc(28px * var(--resume-font-scale, 1))" }}>
                  {(data.fullName || "YOUR NAME").split(" ").map((w, i) => (<span key={i} className="block">{w}</span>))}
                </h1>
                <p className="text-gray-500 tracking-widest mt-1 text-[13px]">PROFESSIONAL</p>
              </div>
              {(data.gradCourse || data.interSchool) && (
                <div className="mb-5">
                  <div className="font-bold uppercase border-b-2 pb-1 mb-3" style={{ color: primary, borderColor: primary }}>Education</div>
                  {data.gradCourse && (
                    <div className="relative pl-5 border-l-2 mb-3" style={{ borderColor: primary }}>
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                      <p className="font-bold text-gray-700">{data.gradCourse}</p>
                      <p className="text-gray-500 text-[10px] uppercase">{data.gradCollege || data.gradUniv}</p>
                      <p className="text-gray-500 text-[10px]">{data.gradDiv}</p>
                    </div>
                  )}
                  {data.interSchool && (
                    <div className="relative pl-5 border-l-2" style={{ borderColor: primary }}>
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                      <p className="font-bold text-gray-700">Intermediate</p>
                      <p className="text-gray-500 text-[10px]">{data.interSchool}</p>
                    </div>
                  )}
                </div>
              )}
              {data.workExperience && (
                <div>
                  <div className="font-bold uppercase border-b-2 pb-1 mb-3" style={{ color: primary, borderColor: primary }}>Experience</div>
                  <div className="relative pl-5 border-l-2" style={{ borderColor: primary }}>
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line"><RichText value={data.workExperience} /></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.layoutType === "juliana-pro") {
    const primary = s.primaryColor || "#1c3b5e";
    const accent = s.accentColor || "#dca342";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative overflow-hidden grid"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: s.fontFamily, gridTemplateColumns: "260px 1fr" }}
          >
            <WatermarkOverlay />
            <div className="text-white p-6 space-y-4" style={{ backgroundColor: primary, fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div className="text-center">
                {showPhoto ? (
                  <img src={data.photo} alt="Profile" className="rounded-full border-2 border-white mx-auto" style={{
                    width: photoPx || 110, height: photoPx || 110,
                    objectFit: "var(--resume-photo-fit, cover)",
                    objectPosition: "var(--resume-photo-position, center)",
                  }} crossOrigin="anonymous" />
                ) : (<div className="rounded-full bg-white/20 mx-auto" style={{ width: 110, height: 110 }} />)}
              </div>
              <div>
                <div className="rounded-full text-center text-[11px] font-bold tracking-wider py-1.5 mb-2" style={{ backgroundColor: "#142a43" }}>ABOUT ME</div>
                <p className="text-white/80 leading-relaxed text-[11px]"><RichText value={data.summary || ""} /></p>
              </div>
              {skillItemsAll.length > 0 && (
                <div>
                  <div className="rounded-full text-center text-[11px] font-bold tracking-wider py-1.5 mb-2" style={{ backgroundColor: "#142a43" }}>SKILLS</div>
                  {skillItemsAll.slice(0, 5).map((sk, i) => (
                    <div key={i} className="mb-2">
                      <span className="text-[10px]">{sk}</span>
                      <div className="h-1.5 rounded overflow-hidden mt-0.5" style={{ backgroundColor: "#142a43" }}>
                        <div className="h-full" style={{ width: `${65 + (i % 4) * 8}%`, backgroundColor: accent }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-8" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div className="mb-4">
                <h1 className="font-bold tracking-widest uppercase" style={{ color: primary, fontSize: "calc(26px * var(--resume-font-scale, 1))" }}>{data.fullName || "YOUR NAME"}</h1>
                <p className="text-gray-400 tracking-wider text-[13px] mt-1">PROFESSIONAL</p>
              </div>
              <div className="mb-4">
                <div className="inline-block rounded-full text-white text-[11px] font-bold tracking-wider px-4 py-1 mb-2" style={{ backgroundColor: primary }}>CONTACT</div>
                <div className="text-gray-600 space-y-1">
                  {data.phone && <p>📞 {data.phone}</p>}
                  {data.email && <p>✉️ {data.email}</p>}
                  {data.address && <p className="whitespace-pre-line">📍 {data.address}</p>}
                </div>
              </div>
              {data.workExperience && (
                <div className="mb-4">
                  <div className="inline-block rounded-full text-white text-[11px] font-bold tracking-wider px-4 py-1 mb-2" style={{ backgroundColor: primary }}>EXPERIENCE</div>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line"><RichText value={data.workExperience} /></div>
                </div>
              )}
              {(data.gradCourse || data.interSchool) && (
                <div>
                  <div className="inline-block rounded-full text-white text-[11px] font-bold tracking-wider px-4 py-1 mb-2" style={{ backgroundColor: primary }}>EDUCATION</div>
                  {data.gradCourse && (
                    <div className="mb-2">
                      <p className="font-semibold" style={{ color: primary }}>{data.gradCourse}</p>
                      <p className="text-gray-500 text-[10px]">{[data.gradCollege, data.gradUniv].filter(Boolean).join(" • ")}</p>
                    </div>
                  )}
                  {data.interSchool && (
                    <div>
                      <p className="font-semibold" style={{ color: primary }}>Intermediate</p>
                      <p className="text-gray-500 text-[10px]">{data.interSchool}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.layoutType === "rohan-pro") {
    const primary = s.primaryColor || "#1a233a";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative overflow-hidden grid"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: s.fontFamily, gridTemplateColumns: "1fr 240px" }}
          >
            <WatermarkOverlay />
            <div className="p-6 space-y-4" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div>
                <div className="font-bold uppercase border-b-2 pb-1 mb-2" style={{ color: primary, borderColor: primary }}>Summary</div>
                <p className="text-gray-600 leading-relaxed"><RichText value={data.summary || ""} /></p>
              </div>
              {(data.gradCourse || data.interSchool || data.sscSchool) && (
                <div>
                  <div className="font-bold uppercase border-b-2 pb-1 mb-2" style={{ color: primary, borderColor: primary }}>Education</div>
                  <table className="w-full border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-1.5 text-left">Degree</th>
                        <th className="border border-gray-300 p-1.5 text-left">Institution</th>
                        <th className="border border-gray-300 p-1.5 text-left">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.gradCourse && (
                        <tr>
                          <td className="border border-gray-300 p-1.5 font-medium">{data.gradCourse}</td>
                          <td className="border border-gray-300 p-1.5">{data.gradCollege || data.gradUniv || "-"}</td>
                          <td className="border border-gray-300 p-1.5">{data.gradDiv || "-"}</td>
                        </tr>
                      )}
                      {data.interSchool && (
                        <tr>
                          <td className="border border-gray-300 p-1.5 font-medium">Intermediate</td>
                          <td className="border border-gray-300 p-1.5">{data.interSchool}</td>
                          <td className="border border-gray-300 p-1.5">{data.interDiv || "-"}</td>
                        </tr>
                      )}
                      {data.sscSchool && (
                        <tr>
                          <td className="border border-gray-300 p-1.5 font-medium">SSC</td>
                          <td className="border border-gray-300 p-1.5">{data.sscSchool}</td>
                          <td className="border border-gray-300 p-1.5">{data.sscDiv || "-"}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {skillItemsAll.length > 0 && (
                <div>
                  <div className="font-bold uppercase border-b-2 pb-1 mb-2" style={{ color: primary, borderColor: primary }}>Skills</div>
                  <ul className="list-disc pl-4 text-gray-600 space-y-1">
                    {skillItemsAll.map((sk, i) => (<li key={i}>{sk}</li>))}
                  </ul>
                </div>
              )}
              {data.workExperience && (
                <div>
                  <div className="font-bold uppercase border-b-2 pb-1 mb-2" style={{ color: primary, borderColor: primary }}>Experience</div>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line"><RichText value={data.workExperience} /></div>
                </div>
              )}
            </div>
            <div className="text-white p-5 space-y-4" style={{ backgroundColor: primary, fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              {showPhoto ? (
                <img src={data.photo} alt="Profile" className="w-full rounded" style={{
                  height: Math.round((photoPx || 100) * 1.4),
                  objectFit: "var(--resume-photo-fit, cover)",
                  objectPosition: "var(--resume-photo-position, center)",
                }} crossOrigin="anonymous" />
              ) : (
                <div className="w-full bg-white/10 rounded" style={{ height: 140 }} />
              )}
              <div>
                <div className="text-[18px] font-bold">{data.fullName || "YOUR NAME"}</div>
                <div className="text-white/70 text-[12px] mt-0.5">Software / Professional</div>
              </div>
              <div>
                <div className="font-bold uppercase border-b border-white/30 pb-1 mb-2 text-[12px]">Contact</div>
                {data.email && <p className="mb-1.5 text-white/90">✉️ {data.email}</p>}
                {data.phone && <p className="mb-1.5 text-white/90">📞 {data.phone}</p>}
                {data.address && <p className="text-white/90 whitespace-pre-line">📍 {data.address}</p>}
              </div>
              {hobbiesList.length > 0 && (
                <div>
                  <div className="font-bold uppercase border-b border-white/30 pb-1 mb-2 text-[12px]">Languages / Interests</div>
                  {hobbiesList.map((h, i) => (<p key={i} className="text-white/90 mb-1">• {h}</p>))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.layoutType === "minlee-pro") {
    const primary = s.primaryColor || "#ff4d4d";
    const banner = s.headerBg || "#ffe3e3";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative overflow-hidden"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: s.fontFamily }}
          >
            <WatermarkOverlay />
            <div className="h-8 -mx-4 -mt-2 mb-3" style={{ backgroundColor: banner }} />
            <div className="text-center mb-2">
              {showPhoto ? (
                <img src={data.photo} alt="Profile" className="mx-auto" style={{
                  width: photoPx || 80, height: Math.round((photoPx || 80) * 1.2),
                  objectFit: "var(--resume-photo-fit, cover)",
                  objectPosition: "var(--resume-photo-position, center)",
                }} crossOrigin="anonymous" />
              ) : (<div className="bg-gray-200 mx-auto" style={{ width: 80, height: 96 }} />)}
            </div>
            <h1 className="text-center font-bold tracking-widest uppercase mb-5" style={{ color: primary, fontSize: "calc(26px * var(--resume-font-scale, 1))" }}>{data.fullName || "YOUR NAME"}</h1>
            <div className="font-bold text-[12px] px-2 py-1 mb-2 border-b" style={{ backgroundColor: banner, color: primary, borderColor: primary }}>CONTACT</div>
            <div className="flex justify-between text-[11px] text-gray-700 mb-4 flex-wrap gap-2">
              {data.address && <span><b>Address:</b> {data.address.split("\n")[0]}</span>}
              {data.phone && <span><b>Phone:</b> {data.phone}</span>}
              {data.email && <span><b>Email:</b> {data.email}</span>}
            </div>
            {data.summary && (
              <>
                <div className="font-bold text-[12px] px-2 py-1 mb-2 border-b" style={{ backgroundColor: banner, color: primary, borderColor: primary }}>RESUME OBJECTIVE</div>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-4"><RichText value={data.summary} /></p>
              </>
            )}
            {data.workExperience && (
              <>
                <div className="font-bold text-[12px] px-2 py-1 mb-2 border-b" style={{ backgroundColor: banner, color: primary, borderColor: primary }}>WORK HISTORY</div>
                <div className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-line mb-4"><RichText value={data.workExperience} /></div>
              </>
            )}
            {(data.gradCourse || data.interSchool) && (
              <>
                <div className="font-bold text-[12px] px-2 py-1 mb-2 border-b" style={{ backgroundColor: banner, color: primary, borderColor: primary }}>EDUCATION</div>
                {data.gradCourse && (
                  <div className="mb-2 text-[11px]">
                    <p className="font-bold text-gray-800">{data.gradCourse}</p>
                    <p className="text-gray-500">{[data.gradCollege, data.gradUniv, data.gradDiv].filter(Boolean).join(" • ")}</p>
                  </div>
                )}
                {data.interSchool && (
                  <div className="text-[11px]">
                    <p className="font-bold text-gray-800">Intermediate</p>
                    <p className="text-gray-500">{data.interSchool}</p>
                  </div>
                )}
              </>
            )}
            {skillItemsAll.length > 0 && (
              <>
                <div className="font-bold text-[12px] px-2 py-1 mb-2 mt-3 border-b" style={{ backgroundColor: banner, color: primary, borderColor: primary }}>SKILLS</div>
                <ul className="list-disc pl-5 text-[11px] text-gray-600">
                  {skillItemsAll.map((sk, i) => <li key={i}>{sk}</li>)}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (template.layoutType === "jessica-pro") {
    const primary = s.primaryColor || "#1a2e40";
    const accent = s.accentColor || "#e6b800";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative overflow-hidden"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: s.fontFamily }}
          >
            <WatermarkOverlay />
            <div className="text-white p-6 flex gap-5 items-center" style={{ backgroundColor: primary }}>
              <div className="flex-1">
                <h1 className="text-[24px] font-bold">{data.fullName || "YOUR NAME"}</h1>
                <p className="text-[14px] mt-1" style={{ color: accent }}>Professional</p>
                <p className="text-[11px] text-white/70 mt-2 leading-relaxed line-clamp-3"><RichText value={data.summary || ""} /></p>
              </div>
              {showPhoto && (
                <img src={data.photo} alt="Profile" className="rounded-full border-4 shrink-0" style={{
                  width: photoPx || 100, height: photoPx || 100, borderColor: accent,
                  objectFit: "var(--resume-photo-fit, cover)",
                  objectPosition: "var(--resume-photo-position, center)",
                }} crossOrigin="anonymous" />
              )}
            </div>
            <div className="p-6 grid grid-cols-2 gap-5" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div>
                {data.workExperience && (
                  <div className="mb-4">
                    <div className="font-bold uppercase text-[12px] border-b-2 pb-1 mb-2" style={{ color: accent, borderColor: accent }}>Work Experience</div>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-line"><RichText value={data.workExperience} /></div>
                  </div>
                )}
              </div>
              <div>
                {skillItemsAll.length > 0 && (
                  <div className="mb-4">
                    <div className="font-bold uppercase text-[12px] border-b-2 pb-1 mb-2" style={{ color: accent, borderColor: accent }}>Hard Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {skillItemsAll.map((sk, i) => (<span key={i} className="text-white text-[10px] px-2 py-1 rounded" style={{ backgroundColor: primary }}>{sk}</span>))}
                    </div>
                  </div>
                )}
                {(data.gradCourse || data.interSchool) && (
                  <div>
                    <div className="font-bold uppercase text-[12px] border-b-2 pb-1 mb-2" style={{ color: accent, borderColor: accent }}>Education</div>
                    {data.gradCourse && (
                      <div className="mb-2">
                        <p className="font-bold" style={{ color: primary }}>{data.gradCourse}</p>
                        <p className="text-[10px] italic" style={{ color: accent }}>{data.gradCollege || data.gradUniv}</p>
                      </div>
                    )}
                    {data.interSchool && (
                      <div>
                        <p className="font-bold" style={{ color: primary }}>Intermediate</p>
                        <p className="text-[10px] italic" style={{ color: accent }}>{data.interSchool}</p>
                      </div>
                    )}
                  </div>
                )}
                {(data.phone || data.email || data.address) && (
                  <div className="mt-4">
                    <div className="font-bold uppercase text-[12px] border-b-2 pb-1 mb-2" style={{ color: accent, borderColor: accent }}>Contact</div>
                    {data.phone && <p className="text-gray-600 mb-1">📞 {data.phone}</p>}
                    {data.email && <p className="text-gray-600 mb-1">✉️ {data.email}</p>}
                    {data.address && <p className="text-gray-600 whitespace-pre-line">📍 {data.address}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.layoutType === "radhika-pro") {
    const primary = s.primaryColor || "#5c8d89";
    const bannerBg = s.headerBg || "#e8d3c5";
    return (
      <div className="w-full overflow-x-auto p-2 sm:p-4 flex justify-center bg-gray-100">
        <div className="transform scale-[0.45] xs:scale-[0.55] sm:scale-[0.75] md:scale-[0.85] lg:scale-100 origin-top transition-transform duration-200">
          <div
            id="resume-document"
            ref={resumeDocRef}
            {...previewProtectionProps}
            className="bg-white mx-auto relative overflow-hidden grid"
            style={{ ...a4Style, "--resume-font-scale": autoFontScale, fontFamily: s.fontFamily, gridTemplateColumns: "240px 1fr" }}
          >
            <WatermarkOverlay />
            <div className="text-white p-6 space-y-4" style={{ backgroundColor: primary, fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div className="text-center">
                {showPhoto ? (
                  <img src={data.photo} alt="Profile" className="rounded-full border-2 border-white mx-auto" style={{
                    width: photoPx || 110, height: photoPx || 110,
                    objectFit: "var(--resume-photo-fit, cover)",
                    objectPosition: "var(--resume-photo-position, center)",
                  }} crossOrigin="anonymous" />
                ) : (<div className="rounded-full bg-white/20 mx-auto" style={{ width: 110, height: 110 }} />)}
              </div>
              <div>
                <div className="text-[12px] font-bold tracking-wider border-b border-white/40 pb-1 mb-2">PROFILE</div>
                <p className="text-white/90 leading-relaxed text-[11px]"><RichText value={data.summary || ""} /></p>
              </div>
              <div>
                <div className="text-[12px] font-bold tracking-wider border-b border-white/40 pb-1 mb-2">CONTACT ME</div>
                {data.phone && <p className="text-white/90 mb-1">📞 {data.phone}</p>}
                {data.email && <p className="text-white/90 mb-1 break-all">✉️ {data.email}</p>}
                {data.address && <p className="text-white/90 whitespace-pre-line">📍 {data.address}</p>}
              </div>
            </div>
            <div className="p-6" style={{ fontSize: "calc(11px * var(--resume-font-scale, 1))" }}>
              <div className="p-5 -mx-6 -mt-6 mb-5" style={{ backgroundColor: bannerBg }}>
                <h1 className="font-bold uppercase tracking-widest" style={{ color: "#333", fontSize: "calc(24px * var(--resume-font-scale, 1))" }}>{data.fullName || "YOUR NAME"}</h1>
                <p className="text-gray-600 italic text-[13px] mt-1">Professional / Student</p>
              </div>
              {(data.gradCourse || data.interSchool || data.sscSchool) && (
                <div className="mb-4">
                  <div className="font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primary }}>
                    <span className="text-[10px]">▶</span> Education
                  </div>
                  {data.gradCourse && (
                    <div className="mb-2">
                      <p className="font-bold uppercase text-gray-800 text-[12px]">{data.gradCourse}</p>
                      <p className="text-gray-600">{[data.gradCollege, data.gradUniv, data.gradDiv].filter(Boolean).join(" • ")}</p>
                    </div>
                  )}
                  {data.interSchool && (
                    <div className="mb-2">
                      <p className="font-bold uppercase text-gray-800 text-[12px]">Intermediate</p>
                      <p className="text-gray-600">{[data.interSchool, data.interBoard].filter(Boolean).join(" • ")}</p>
                    </div>
                  )}
                  {data.sscSchool && (
                    <div>
                      <p className="font-bold uppercase text-gray-800 text-[12px]">SSC / High School</p>
                      <p className="text-gray-600">{data.sscSchool}</p>
                    </div>
                  )}
                </div>
              )}
              {skillItemsAll.length > 0 && (
                <div className="mb-4">
                  <div className="font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primary }}>
                    <span className="text-[10px]">▶</span> Computer Skills
                  </div>
                  {skillItemsAll.map((sk, i) => (<p key={i} className="text-gray-600 mb-1">• {sk}</p>))}
                </div>
              )}
              {data.workExperience && (
                <div>
                  <div className="font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primary }}>
                    <span className="text-[10px]">▶</span> Experience
                  </div>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line"><RichText value={data.workExperience} /></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 text-center text-slate-500">Template not found</div>
  );
}