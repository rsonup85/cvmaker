/**
 * CVMaker AI - Layout & Page Measurement Engine
 * Utilities for A4 document height measurement and auto-fit calculations.
 */

// Standard A4 dimensions in px at standard 96 DPI
export const A4_WIDTH_PX = 794; // 210mm
export const A4_HEIGHT_PX = 1123; // 297mm

export interface PageOverflowInfo {
  totalHeight: number;
  pageCount: number;
  overflowPx: number;
  isOverflowing: boolean;
  recommendedScale: number;
}

/**
 * Measures an HTML element against standard A4 page height
 */
export function measureElementOverflow(element: HTMLElement | null): PageOverflowInfo {
  if (!element) {
    return {
      totalHeight: A4_HEIGHT_PX,
      pageCount: 1,
      overflowPx: 0,
      isOverflowing: false,
      recommendedScale: 1
    };
  }

  const scrollHeight = element.scrollHeight || element.offsetHeight;
  const pageCount = Math.max(1, Math.ceil(scrollHeight / A4_HEIGHT_PX));
  const overflowPx = Math.max(0, scrollHeight - A4_HEIGHT_PX);
  const isOverflowing = scrollHeight > A4_HEIGHT_PX + 20;

  // Auto-fit scale if content slightly overflows single page
  let recommendedScale = 1;
  if (isOverflowing && scrollHeight < A4_HEIGHT_PX * 1.25) {
    recommendedScale = Number((A4_HEIGHT_PX / scrollHeight).toFixed(2));
  }

  return {
    totalHeight: scrollHeight,
    pageCount,
    overflowPx,
    isOverflowing,
    recommendedScale
  };
}
