# CV Maker AI — Architecture (v4)

```
resumeData / designSettings / templateId
              │
              ▼
        Layout Router
   (Job | Resume | Marriage)
              │
              ▼
     Live DOM  #resume-document
              │
              ▼
      Measurement Engine
   (fits? used/avail ratio)
              │
              ▼
         Page Manager
     ┌────────┴────────┐
     │                 │
    FIT              OVERFLOW
  max readable      preferPagination
  scale on 1 page   (keep readable floor)
     │                 │
     └────────┬────────┘
              ▼
        Page surface
     (1 page / multi hint)
              ▼
        PDF Renderer
     (html2pdf / print)
```

## Modules

| Path | Role |
|------|------|
| `src/engine/measurement.js` | Content weight, A4 area, fit test, binary-search scale |
| `src/engine/pageManager.js` | Single-page vs pagination decision |
| `src/engine/layoutRouter.jsx` | Routes template → Job / Marriage / Resume engine |
| `src/hooks/useAutoFit.js` | React hook: auto re-measure on data/design/viewport change |
| `src/components/MobilePreviewFit.jsx` | Scales A4 to mobile width (no horizontal overflow) |
| `src/ResumeRenderer.jsx` | Owns DOM ref, runs AutoFit, composes layout engines |

## AutoFit policy

- **Automatic** — runs on template, name, education, experience, photo, font, spacing, margins, viewport changes.
- **No button required** (Design panel still has “Auto Fit to 1 Page” as a manual force).
- Chooses the **largest readable scale** that fits one A4 page.
- If content cannot fit above the readable floor → `preferPagination` (does not shrink text to unreadable sizes).

## Mobile UI

- Bottom tabs: Menu / Edit / Preview
- Design panel = **bottom sheet** on mobile, right drawer on desktop
- Inputs ≥ 16px (iOS zoom prevention)
- Preview uses `MobilePreviewFit` — A4 width fits screen; vertical scroll only
- Desktop keeps manual zoom control

## Job vs Marriage

- Job flow default template: `tpl-b-001` (`layoutType: job-simple`)
- Marriage flow: `tpl-m-001` (`layoutType: marriage-500`)
- Guard effect keeps selected template inside the correct pool

## Missing backend stubs

These client modules ship with safe offline defaults so the app runs without Firebase:

- `src/lib/serverApi.js`
- `src/data/pricing.js`
- `src/i18n.js` (en + hi)
