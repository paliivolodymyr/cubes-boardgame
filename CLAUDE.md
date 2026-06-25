# CLAUDE.md

Guidance for AI agents working in this repository.

## Project

**Кубики** — a step-by-step dice game for 1–8 players. Pure client-side
HTML/CSS/JS with **no dependencies and no build step**. Ships as an installable
**PWA** that works fully offline. Deployed via **GitHub Pages** (merge to `main`
→ site updates automatically).

## Key files

- `index.html` — the entire game (HTML + CSS + JS in one file), plus the
  service-worker registration and update-prompt script at the bottom.
- `sw.js` — service worker. Network-first for navigation, cache-first for static
  assets. Uses a **versioned cache name** (`kubiky-<VERSION>`).
- `manifest.webmanifest` — PWA manifest.
- `CHANGELOG.md` — versioned history (Keep a Changelog + SemVer).

## Versioning & release rules — IMPORTANT

This project has no `package.json`; the **single source of truth for the version
is the `VERSION` constant in `sw.js`**. On every change that ships to users:

1. **Bump the version** following [SemVer](https://semver.org/): patch for
   fixes, minor for features, major for breaking changes.
2. **Update `VERSION` in `sw.js`.** This changes the cache name, which is what
   forces installed PWAs to fetch the new version and drop the stale cache.
   Skipping this is the #1 cause of "the website updated but the PWA didn't."
3. **Update `CHANGELOG.md`**: add a new `## [x.y.z] — YYYY-MM-DD` section at the
   top with `Added` / `Changed` / `Fixed` / `Removed` subsections as relevant.
   Keep the newest version first, and add the matching link at the bottom.
4. **Update `README.md`** when behaviour or features change in a user-visible way
   (new abilities, changed rules, new structure). Docs must reflect the code.

**Never ship a code change without updating the docs.** Every PR that touches
`index.html` / `sw.js` should bump `VERSION` and update `CHANGELOG.md` (and
`README.md` when user-facing). Treat missing changelog/version as an incomplete
change — check this before committing.

Keep the `VERSION` in `sw.js` and the latest `CHANGELOG.md` entry in sync.

## Conventions

- User-facing text and code comments are in **Ukrainian**; match the existing
  style.
- Keep paths **relative** (`./...`) so the app works both at a domain root and
  in a subpath.
- No frameworks, no build tooling — keep it vanilla.

## Testing locally

Service workers don't run from `file://`. Serve over HTTP:

```bash
npx serve .            # or: python3 -m http.server 8000
```
