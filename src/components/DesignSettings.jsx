import React from "react";
import {
  Settings2,
  RotateCcw,
  Image as ImageIcon,
  Type,
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

export function DesignSettings({ settings, onChange, isOpen, onToggle, className = "", showColumnWidth = true }) {

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        title="Design Adjustments"
      >
        <Settings2 size={14} />
        Design
      </button>
    );
  }

  const set = (key, value) => onChange({ ...settings, [key]: value });

  const inputCls =
    "w-full bg-white border border-gray-200 text-gray-800 px-2 py-1.5 text-xs rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";
  const labelCls = "text-[11px] font-semibold text-gray-600 block mb-0.5";

  const stepVal = (key, delta, min, max, decimals = 0) => {
    const cur = Number(settings[key]);
    let next = cur + delta;
    if (decimals) next = Number(next.toFixed(decimals));
    next = Math.min(max, Math.max(min, next));
    const patch = { ...settings, [key]: next };
    // Any manual change to scale/font locks manual mode so auto-fit stops fighting the user
    if (key === "contentScale" || key === "fontSize") patch.manualMode = true;
    onChange(patch);
  };

  const Stepper = ({ value, unit = "", onMinus, onPlus }) => (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onMinus} className="w-6 h-6 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold hover:bg-slate-100 leading-none">−</button>
      <span className="text-[11px] font-mono text-blue-600 min-w-[3.2rem] text-center">{value}{unit}</span>
      <button type="button" onClick={onPlus} className="w-6 h-6 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold hover:bg-slate-100 leading-none">+</button>
    </div>
  );

  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-3 text-left w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 sticky top-0 bg-white z-10 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <Settings2 size={16} className="text-blue-600" />
          Design Adjustments
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChange({ ...DEFAULT_DESIGN })}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
            title="Reset defaults"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
          >
            Close
          </button>
        </div>
      </div>

      {/* Page Size */}
      <div>
        <label className={labelCls}>📄 Page Size</label>
        <select
          className={inputCls}
          value={settings.pageSize}
          onChange={(e) => set("pageSize", e.target.value)}
        >
          <option value="A4">A4 (210 × 297 mm)</option>
          <option value="Letter">Letter (8.5 × 11 in)</option>
          <option value="Custom">Custom</option>
        </select>
      </div>

      {settings.pageSize === "Custom" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Width (mm)</label>
            <input type="number" min={100} max={400} className={inputCls}
              value={settings.customWidth}
              onChange={(e) => set("customWidth", Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>Height (mm)</label>
            <input type="number" min={100} max={500} className={inputCls}
              value={settings.customHeight}
              onChange={(e) => set("customHeight", Number(e.target.value))} />
          </div>
        </div>
      )}

      {/* ===== FONT SECTION ===== */}
      <div className="border-t border-slate-100 pt-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Type size={12} className="text-blue-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Font Settings</span>
        </div>

        {/* Font Size */}
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <label className={labelCls}>🔤 Font Size</label>
            <Stepper value={settings.fontSize} unit=" px"
              onMinus={() => stepVal("fontSize", -0.5, 7, 18, 1)}
              onPlus={() => stepVal("fontSize", 0.5, 7, 18, 1)} />
          </div>
          <input type="range" min={7} max={18} step={0.5}
            value={settings.fontSize}
            onChange={(e) => {
              set("fontSize", Number(e.target.value));
              if (!settings.manualMode) set("manualMode", true);
            }}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>7px</span><span>12px</span><span>18px</span>
          </div>
        </div>

        {/* Line Spacing */}
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <label className={labelCls}>↕️ Line Spacing</label>
            <Stepper value={settings.lineSpacing}
              onMinus={() => stepVal("lineSpacing", -0.05, 0.8, 2.2, 2)}
              onPlus={() => stepVal("lineSpacing", 0.05, 0.8, 2.2, 2)} />
          </div>
          <input type="range" min={0.8} max={2.2} step={0.05}
            value={settings.lineSpacing}
            onChange={(e) => set("lineSpacing", Number(e.target.value))}
            className="w-full accent-blue-600" />
        </div>

        {/* Section Spacing */}
        <div className="mb-3">
          <label className={labelCls}>📦 Section Spacing</label>
          <div className="flex gap-1">
            {["compact", "normal", "relaxed"].map((v) => (
              <button key={v} type="button" onClick={() => set("sectionSpacing", v)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md border transition capitalize ${
                  settings.sectionSpacing === v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Scale */}
        <div>
          <div className="flex justify-between items-center">
            <label className={labelCls}>🔍 Overall Scale</label>
            <Stepper value={settings.contentScale} unit="%"
              onMinus={() => stepVal("contentScale", -5, 60, 160)}
              onPlus={() => stepVal("contentScale", 5, 60, 160)} />
          </div>
          <input type="range" min={60} max={160} step={1}
            value={settings.contentScale}
            onChange={(e) => {
              set("contentScale", Number(e.target.value));
              if (!settings.manualMode) set("manualMode", true);
            }}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>60%</span><span>100%</span><span>160%</span>
          </div>
        </div>
      </div>

      {/* ===== PHOTO SECTION ===== */}
      <div className="border-t border-slate-100 pt-2">
        <div className="flex items-center gap-1.5 mb-2">
          <ImageIcon size={12} className="text-blue-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Photo Settings</span>
        </div>

        {/* Photo Size */}
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <label className={labelCls}>🖼️ Photo Size</label>
            <Stepper value={settings.photoSize} unit=" px"
              onMinus={() => stepVal("photoSize", -4, 36, 160)}
              onPlus={() => stepVal("photoSize", 4, 36, 160)} />
          </div>
          <input type="range" min={36} max={160} step={2}
            value={settings.photoSize}
            onChange={(e) => set("photoSize", Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>36px</span><span>72px</span><span>160px</span>
          </div>
        </div>

        {/* Photo Fit */}
        <div className="mb-3">
          <label className={labelCls}>📐 Photo Fit (stretch fix)</label>
          <div className="flex gap-1">
            {[
              { v: "cover", l: "Cover (crop)" },
              { v: "contain", l: "Contain (fit)" },
            ].map(({ v, l }) => (
              <button key={v} type="button" onClick={() => set("photoFit", v)}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md border transition ${
                  settings.photoFit === v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Cover = box bhar dega (crop) · Contain = poori photo dikhegi
          </p>
        </div>

        {/* Photo Position */}
        <div>
          <label className={labelCls}>🎯 Photo Focus Position</label>
          <div className="flex gap-1">
            {[
              { v: "top", l: "Top" },
              { v: "center", l: "Center" },
              { v: "bottom", l: "Bottom" },
            ].map(({ v, l }) => (
              <button key={v} type="button" onClick={() => set("photoPosition", v)}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md border transition ${
                  settings.photoPosition === v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}>
                {l}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Photo crop hone par kaunsa hissa dikhe
          </p>
        </div>
      </div>

      {/* ===== LAYOUT SECTION ===== */}
      <div className="border-t border-slate-100 pt-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Maximize2 size={12} className="text-blue-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Layout</span>
        </div>

        {/* Column Width — only for job / sidebar templates */}
        {showColumnWidth && (
          <div className="mb-3">
            <div className="flex justify-between items-center">
              <label className={labelCls}>Columns Width (sidebar %)</label>
              <Stepper value={settings.columnWidth} unit="%"
                onMinus={() => stepVal("columnWidth", -2, 22, 70)}
                onPlus={() => stepVal("columnWidth", 2, 22, 70)} />
            </div>
            <input type="range" min={22} max={70} step={1}
              value={settings.columnWidth}
              onChange={(e) => set("columnWidth", Number(e.target.value))}
              className="w-full accent-blue-600" />
            <p className="text-[10px] text-slate-400">2-column / sidebar templates par</p>
          </div>
        )}

        {/* Content Position Y */}
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <label className={labelCls}>↕️ Content Position</label>
            <Stepper value={(settings.contentOffsetY > 0 ? "+" : "") + settings.contentOffsetY} unit=" mm"
              onMinus={() => stepVal("contentOffsetY", -1, -8, 8)}
              onPlus={() => stepVal("contentOffsetY", 1, -8, 8)} />
          </div>
          <input type="range" min={-8} max={8} step={0.5}
            value={settings.contentOffsetY}
            onChange={(e) => set("contentOffsetY", Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>↑ Up</span><span>Center</span><span>Down ↓</span>
          </div>
        </div>

        {/* Template Width */}
        <div>
          <label className={labelCls}>📝 Template Width</label>
          <div className="flex gap-1">
            {["narrow", "normal", "wide"].map((v) => (
              <button key={v} type="button" onClick={() => set("templateWidth", v)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md capitalize border transition ${
                  settings.templateWidth === v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 leading-snug border-t border-slate-100 pt-2">
        Changes live preview pe turant dikhenge.
      </p>
    </div>
  );
}