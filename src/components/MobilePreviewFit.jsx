import React, { useEffect, useRef, useState } from "react";

/**
 * Scales an A4 preview to fit the mobile viewport width.
 * Does NOT use browser-level page zoom — only CSS transform on the canvas.
 * Horizontal overflow is prevented; user can still scroll vertically.
 */
export function MobilePreviewFit({ children, pageWidthMm = 210, padding = 24 }) {
  const hostRef = useRef(null);
  const [scale, setScale] = useState(0.45);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return undefined;

    const compute = () => {
      const avail = Math.max(200, el.clientWidth - padding);
      // 210mm ≈ 794px at 96dpi
      const pagePx = pageWidthMm * (96 / 25.4);
      const next = Math.min(1, Math.max(0.28, avail / pagePx));
      setScale(Number(next.toFixed(3)));
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("orientationchange", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", compute);
    };
  }, [pageWidthMm, padding]);

  const pagePx = pageWidthMm * (96 / 25.4);

  return (
    <div ref={hostRef} className="mobile-preview-fit w-full">
      <div
        className="preview-scale-wrap"
        style={{
          transform: `scale(${scale})`,
          width: pagePx,
          // Reserve layout space so vertical scroll accounts for scaled height
          marginBottom: `calc(${297 * (96 / 25.4)}px * ${scale - 1})`,
        }}
      >
        {children}
      </div>
      <div className="text-center text-[10px] text-slate-400 mt-2 font-medium">
        Auto-fit · {Math.round(scale * 100)}% of A4 width
      </div>
    </div>
  );
}
