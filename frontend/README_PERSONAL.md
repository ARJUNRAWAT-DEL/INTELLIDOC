Personal site scaffold
======================

Files added under `frontend/src/pages` and `frontend/src/components` to provide a small personal website scaffold at `/personal`.

How to preview
--------------
1. Start the frontend dev server:

```powershell
cd frontend
npm install
npm run dev
```

2. Open http://localhost:5173/personal (or the port shown by Vite).

What to customize
------------------
- `frontend/src/pages/PersonalHome.tsx` — hero copy, tagline, skills.
- `frontend/src/pages/ProjectsPersonal.tsx` — replace placeholder projects with your real projects.
- `frontend/src/pages/ContactPersonal.tsx` — replace the mailto address with your real email or connect to a backend.
- `frontend/src/components/navbar.tsx` — brand initials and links.

Next steps (suggested)
----------------------
- Replace placeholder avatar with your photo (SVG or PNG) and name.
- Add project screenshots and links to GitHub/live demos in `ProjectsPersonal`.
- Add analytics or contact form backend if you want server-side contact handling.

If you want, I can also:
- Replace the existing homepage `/` with this personal site, or
- Add a theme switcher (dark/light), or
- Polish animations and transitions for micro-interactions.
