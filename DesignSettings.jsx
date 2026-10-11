import React, { useState } from "react";
import {
  Settings2,
  RotateCcw,
  Image as ImageIcon,
  X,
  Maximize2,
} from "lucide-react";

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

export function getPageDims(settings) {
  if (settings.pageSize === "Custom") {
    return {
      w: Math.max(100, Number(settings.customWidth) || 210),
      h: Math.max(100, Number(settings.customHeight) || 297),
    };
  }
  return PAGE_PRESETS[settings.pageSize] || PAGE_PRESETS.A4;
}

/** Convert design settings → CSS variables + style for #resume-document */
export function designToStyle(settings) {
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

/**
 * Auto Fit to 1 Page:
 * Binary-search so #resume-document content fits clientHeight.
 * Uses --resume-font-scale in range 0.70–1.35 (professional).
 * Returns updated settings (does not mutate).
 */
export function autoFitToOnePage(currentSettings) {
  const el = document.getElementById("resume-document");
  if (!el) {
    return { ...currentSettings, manualMode: false, fitToOnePage: true };
  }

  const prevScaleVar = el.style.getPropertyValue("--resume-font-scale");
  const baseFont = Number(currentSettings.fontSize) || 10.5;
  const fontFactor = baseFont / 10.5;

  const applyScale = (scale) => {
    const s = Math.max(0.7, Math.min(1.35, scale));
    el.style.setProperty("--resume-font-scale", String(s));
    el.style.setProperty(
      "--hm-font-factor",
      String(Number((s * fontFactor).toFixed(3)))
    );
    void el.offsetHeight;
  };

  const fits = () => el.scrollHeight <= el.clientHeight - 3;

  let lo = 0.7;
  let hi = 1.35;
  let best = 0.7;

  applyScale(lo);
  if (!fits()) {
    if (prevScaleVar) el.style.setProperty("--resume-font-scale", prevScaleVar);
    return {
      ...currentSettings,
      contentScale: 70,
      manualMode: false,
      fitToOnePage: true,
    };
  }

  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    applyScale(mid);
    if (fits()) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  applyScale(best);

  // Restore — React will re-apply from settings / live auto-fit
  if (prevScaleVar) el.style.setProperty("--resume-font-scale", prevScaleVar);

  return {
    ...currentSettings,
    contentScale: Math.round(best * 100),
    manualMode: false,
    fitToOnePage: true,
  };
}

export function DesignSettings({ settings, onChange, isOpen, onToggle, className = "" }) {
  const [fitting, setFitting] = useState(false);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        title="Design & Photo Settings"
      >
        <Settings2 size={14} />
        Design
      </button>
    );
  }

  const set = (key, value) => {
    const patch = { ...settings, [key]: value };
    if (key === "contentScale" || key === "fontSize") {
      patch.manualMode = true;
    }
    onChange(patch);
  };

  const labelCls = "text-[11px] font-semibold text-gray-600 block mb-1";

  const stepVal = (key, delta, min, max, decimals = 0) => {
    const cur = Number(settings[key]);
    let next = cur + delta;
    if (decimals) next = Number(next.toFixed(decimals));
    next = Math.min(max, Math.max(min, next));
    const patch = { ...settings, [key]: next };
    if (key === "contentScale" || key === "fontSize") patch.manualMode = true;
    onChange(patch);
  };

  const Stepper = ({ value, unit = "", onMinus, onPlus }) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onMinus}
        className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-base font-bold hover:bg-slate-100 leading-none active:scale-95"
      >
        −
      </button>
      <span className="text-[12px] font-mono text-blue-600 min-w-[3.5rem] text-center font-bold">
        {value}
        {unit}
      </span>
      <button
        type="button"
        onClick={onPlus}
        className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-base font-bold hover:bg-slate-100 leading-none active:scale-95"
      >
        +
      </button>
    </div>
  );

  const handleAutoFit = () => {
    setFitting(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Unlock auto mode and ask renderer to re-fit
        onChange({
          ...settings,
          manualMode: false,
          fitToOnePage: true,
        });
        window.dispatchEvent(new CustomEvent("cvmaker-autofit-request"));
        setTimeout(() => setFitting(false), 300);
      }, 40);
    });
  };

  return (
    <div className={`flex flex-col bg-white h-full ${className}`}>
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Settings2 size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800 leading-tight">
              Design Settings
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              Auto-fit + photo controls
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_DESIGN })}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            title="Reset to defaults"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            title="Close panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-5">
        {/* Auto Fit button */}
        <button
          type="button"
          onClick={handleAutoFit}
          disabled={fitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-600/25 active:scale-[0.98] transition disabled:opacity-60"
        >
          <Maximize2 size={16} />
          {fitting ? "Fitting…" : "Auto Fit to 1 Page"}
        </button>
        <p className="text-[10px] text-slate-400 -mt-2 text-center leading-snug">
          Text automatically adjusts to fill the full A4 page without overflow.
          {settings.manualMode ? (
            <span className="block text-amber-600 mt-0.5">
              Manual mode on — click Auto Fit to re-enable automatic scaling.
            </span>
          ) : (
            <span className="block text-emerald-600 mt-0.5">Auto mode active</span>
          )}
        </p>

        {/* Content Scale (manual override) */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelCls}>📐 Content Scale</label>
            <Stepper
              value={settings.contentScale}
              unit="%"
              onMinus={() => stepVal("contentScale", -5, 70, 135)}
              onPlus={() => stepVal("contentScale", 5, 70, 135)}
            />
          </div>
          <input
            type="range"
            min={70}
            max={135}
            step={1}
            value={settings.contentScale}
            onChange={(e) => set("contentScale", Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>70%</span>
            <span>100%</span>
            <span>135%</span>
          </div>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelCls}>🔤 Base Font Size</label>
            <Stepper
              value={settings.fontSize}
              unit="px"
              onMinus={() => stepVal("fontSize", -0.5, 8, 14, 1)}
              onPlus={() => stepVal("fontSize", 0.5, 8, 14, 1)}
            />
          </div>
          <input
            type="range"
            min={8}
            max={14}
            step={0.5}
            value={settings.fontSize}
            onChange={(e) => set("fontSize", Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Margins quick */}
        <div>
          <label className={labelCls}>📏 Page Margins (mm)</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["marginTop", "Top"],
              ["marginBottom", "Bottom"],
              ["marginLeft", "Left"],
              ["marginRight", "Right"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-slate-500 w-10">{label}</span>
                <Stepper
                  value={settings[key]}
                  onMinus={() => stepVal(key, -1, 4, 30)}
                  onPlus={() => stepVal(key, 1, 4, 30)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Photo Size */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className={labelCls}>🖼️ Photo Size</label>
            <Stepper
              value={settings.photoSize}
              unit=" px"
              onMinus={() => stepVal("photoSize", -4, 36, 200)}
              onPlus={() => stepVal("photoSize", 4, 36, 200)}
            />
          </div>
          <input
            type="range"
            min={36}
            max={200}
            step={2}
            value={settings.photoSize}
            onChange={(e) => set("photoSize", Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>36px</span>
            <span>100px</span>
            <span>200px</span>
          </div>
        </div>

        {/* Photo Fit */}
        <div>
          <label className={labelCls}>📐 Photo Fit</label>
          <div className="flex gap-1">
            {[
              { v: "cover", l: "Cover (crop)" },
              { v: "contain", l: "Contain (fit)" },
            ].map(({ v, l }) => (
              <button
                key={v}
                type="button"
                onClick={() => set("photoFit", v)}
                className={`flex-1 py-2 text-[11px] font-semibold rounded-lg border transition ${
                  settings.photoFit === v
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Focus */}
        <div>
          <label className={labelCls}>🎯 Photo Focus</label>
          <div className="flex gap-1">
            {[
              { v: "top", l: "Top" },
              { v: "center", l: "Center" },
              { v: "bottom", l: "Bottom" },
            ].map(({ v, l }) => (
              <button
                key={v}
                type="button"
                onClick={() => set("photoPosition", v)}
                className={`flex-1 py-2 text-[11px] font-semibold rounded-lg border transition ${
                  settings.photoPosition === v
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-400 leading-snug border-t border-slate-100 pt-3 text-center">
          Auto Fit keeps text on one page (70%–135% scale). Manual scale/font locks auto mode until you click Auto Fit again.
        </p>
      </div>
    </div>
  );
}
