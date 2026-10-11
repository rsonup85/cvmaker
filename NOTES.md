# Project notes (templates & marriage)

## Original templates
See `src/data/templates.js` and `src/components/OriginalTemplateEngine.jsx`.

## Marriage 500 templates
Marriage layouts use `MarriageTemplateEngine` / HTML engines and `src/data/marriageTemplates.js`.

## Recent flow notes
- Job vs Marriage template pools are guarded in App.
- Form design and marriage/job flow fixes are reflected in current `src/App.jsx` and template engines.
- Prefer deterministic AutoFit (`src/engine`) for A4 fit; AI only for content.
