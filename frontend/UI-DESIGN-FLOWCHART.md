 # IntelliDoc — UI Design & Flowchart

## Summary
- Purpose: Visual, mobile-first UI design and flowcharts for the main user journeys.
- Deliverables in this doc: page map, component list, user flows, ASCII flowcharts, and compact wireframes (mobile + desktop).
- Use this as a handoff to design (Figma) or implementation (frontend components).

---

## Color & token quick reference
- brand-900: `#074c3f` (dark green)
- accent-pink: `#ff6f83` (primary CTA)
- bg-soft: `#fff5f7` (light pink)
- surface: `#ffffff`
- text: `#0b1720`
- muted: `#6b7280`
- radii: sm 6px / md 10px / pill 24px
- spacing scale: 4, 8, 12, 16, 20, 24, 32, 48

---

## High-level page map
- Public: Landing (Hero, Features, Trust, CTA), Pricing, Resources/Docs, Book a demo modal/page, Login/Signup
- Authenticated: Onboarding wizard, Dashboard (Docs list + Viewer + Insights), Integrations, Settings, Support

---

## Top-priority user journeys
1) Visitor → Book a demo (main conversion)
2) Visitor → Pricing → Contact sales / Start trial
3) New user → Signup → Onboarding → Upload doc → Get insights
4) Returning user → Dashboard → Open doc → Export / Share

---

## User journey flowcharts (ASCII)

Visitor → Book a demo (simple)
```
[Visitor]
   |
   v
[Landing: Hero + Primary CTA]
   |
   v
[Book Demo Modal] --(submit)--> [Booking Confirm / Calendar invite] --> [Thank you / follow-up email]
```

Visitor → Pricing → Contact
```
[Visitor]
   |
   v
[Pricing Page] --(choose plan)--> [Contact Sales / Lead Form] --> [Sales follow-up]
```

Signup / Onboarding / Dashboard (detailed)
```
[Visitor]
   |
   v
[Signup (email/magic-link or SSO)]
   |
   v
[Onboarding Wizard]
   - choose persona
   - connect source / upload sample doc
   |
   v
[Dashboard]
   - Docs list / import
   - Viewer (center)
   - Insights panel (right)
   - Actions: export, annotate, share
```

Document processing flow
```
[Upload / Connect]
   |
   v
[Ingest + OCR/Parse] ---> [Processing progress/status]
   |
   v
[Extraction results stored]
   |
   v
[Viewer: highlight text, metadata summary, entity cards]
   |
   v
[Actions: Export CSV / JSON, Copy insights, Create report]
```

---

## Wireframes (mobile-first) — simple sketches you can hand to design

1) Header (mobile)
```
-------------------
[ LOGO ]   [Hamburger]
When opened:
- Top: Logo + Close
- Body: nav links (Solution, Resources, Pricing)
- Bottom sticky: Book demo (accent-pink pill)
```

2) Hero (mobile)
```
H1: "Smarter document intelligence for your team"
Subhead: single line
Primary CTA (accent-pink pill)
Secondary CTA (outline)
Trust row (logos small)
Product mock (stacked below on mobile)
```

Desktop Hero layout (2-column)
- Left column:
  - H1, subhead, CTAs
- Right column:
  - Product preview card (shadowed, rounded)
Hero background: subtle vertical gradient from bg-soft to white

3) Pricing card (responsive)
```
[Plan Title]
[Price / toggle (monthly/annual)]
- bullet 1
- bullet 2
CTA: Get started (button)
Badge: "Most popular" for middle plan
```

4) Book a demo modal (compact)
```
Fields:
- Name
- Business email
- Company size (optional)
- Preferred time / timezone (optional)
Primary CTA: Request demo
After submit: Confirmation + calendar invite OR "we'll reach out" message
```

5) Dashboard — Desktop (3-column)
```
Left column (220px):
- Search
- Folders / Recent
- Import button (primary)

Center column (fluid):
- Viewer header (document title, download, zoom)
- Document viewer (PDF/text) scrollable

Right column (320px):
- Insights (entities: names, dates, amounts)
- Quick actions (Export, Annotate, Create report)
```

Dashboard — Mobile (single column)
```
Top: search + quick import floating button
Then: recent/docs list
Tap doc -> viewer full screen
Slide-over or bottom sheet for Insights
```

---

## Component map (reusable)
- Shell: Header, Footer, Container
- UI primitives: Button (primary/outline), Card, Modal, Badge, Input, Toggle (billing), Toast
- Page components: Hero, FeatureList, PricingGrid, BookDemoModal, LoginCard, OnboardingWizard, DocsList, DocumentViewer, InsightsPanel
- Utilities: Theme tokens, useAnalytics hook, useModal, useUploader

---

## Focused UI details & microcopy
- Primary CTA text examples: "Book a demo", "Get started", "Try free"
- Microcopy for hero CTA: "20-minute demo — no credit card"
- Processing status: "Processing • 45% • Estimated 30s"
- Small badges: DEV MOCK should be subtle with low contrast; remove in production.

---

## Accessibility checklist
- All CTAs have keyboard focus and visible outlines.
- Images & product mockups have alt text.
- Modal traps focus on open and restores on close.
- Color contrast tested for buttons/labels (WCAG AA).
- Reduced motion support via prefers-reduced-motion.

---

## Interaction & animation guidance
- Hover: gentle lift (translateY -4px) + soft shadow
- CTA: subtle scale on press, quick 120ms ease
- Loader: animated dots + progress bar for long processes
- Avoid heavy animations during onboarding; keep it snappy.

---

## Example layout flow (visual step-by-step)
/ Landing page (Hero → Features → Trust → CTA)
/ Click "Book a demo" → modal opens → user submits → confirmation + calendar invite
/ User signs up (if needed) → onboarding wizard (3 steps) → lands on Dashboard
/ Dashboard → user imports document → processing shows progress → results appear in Insights panel → user exports

---

## Developer hints for implementation
- Mobile-first CSS, then expand to tablet/desktop.
- Use CSS variables for design tokens.
- Lazy load heavy modules (DocumentViewer) and images.
- Use SSR for landing pages (if using Next.js) for SEO.
- Track CTA events for A/B testing.

---

## Notes for designers
- Convert each wireframe into 1 responsive artboard (mobile & desktop).
- Provide spacing tokens and type scale in the Figma file.
- Export product mock in multiple resolutions (2x, 3x) and provide SVG icons.

---

## Quick roadmap (implementation order)
1) Header + Hero + Book demo modal (days 1–2)
2) Pricing + Signup/login + Tracking (days 2–4)
3) Onboarding + Dashboard skeleton (week 1)
4) Document viewer + extraction UI (week 2)
5) Docs hub + integrations (week 3)

---

End of UI design and flowchart notes.
