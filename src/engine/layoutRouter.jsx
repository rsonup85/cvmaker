/**
 * Layout Router
 * -------------
 * resumeData + template → Job | Resume | Marriage layout engine.
 *
 * This is the architectural entry point between form data and rendered pages.
 * Measurement / AutoFit live in ResumeRenderer (owns the DOM ref).
 */

import React from "react";
import { getTemplateById, applyPalette, getPaletteById } from "../data/templates";
import OriginalTemplateEngine from "../components/OriginalTemplateEngine";
import MarriageTemplateEngine from "../components/MarriageTemplateEngine";
import { SimpleJobTemplate } from "../components/SimpleJobTemplate";
import { ImportedTemplateRenderer } from "../components/ImportedTemplateRenderer";

export function resolveLayoutFamily(template) {
  if (!template) return "resume";
  if (template.layoutType === "marriage-500") return "marriage";
  if (template.layoutType === "job-simple") return "job";
  if (template.layoutType === "original-200") return "resume";
  if (template.layoutType === "json-image") return "imported";
  return "resume";
}

/**
 * Renders the correct layout engine for a template.
 * resumeDocRef is forwarded so the Measurement Engine can measure the live page.
 */
export function LayoutRouter({
  templateId,
  data,
  isPro = false,
  colorPaletteId,
  designSettings = {},
  autoFontScale = 1,
  resumeDocRef = null,
  previewProtectionProps = {},
  pageW = 210,
  pageH = 297,
  showPhoto = true,
}) {
  const template = getTemplateById(templateId);
  const family = resolveLayoutFamily(template);
  const palette = colorPaletteId ? getPaletteById(colorPaletteId) : null;
  // palette is applied inside engines / ResumeRenderer styles

  if (family === "job") {
    return (
      <SimpleJobTemplate
        data={data}
        isPro={isPro}
        resumeDocRef={resumeDocRef}
        autoFontScale={autoFontScale}
        designSettings={designSettings}
      />
    );
  }

  if (family === "marriage") {
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

  if (family === "resume" && template.layoutType === "original-200") {
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

  if (family === "imported") {
    return (
      <ImportedTemplateRenderer
        template={template}
        data={data}
        designSettings={designSettings}
        autoFontScale={autoFontScale}
      />
    );
  }

  // Fallback: treat as job simple so users always see something professional
  return (
    <SimpleJobTemplate
      data={data}
      isPro={isPro}
      resumeDocRef={resumeDocRef}
      autoFontScale={autoFontScale}
      designSettings={designSettings}
    />
  );
}

export { applyPalette, getTemplateById };
