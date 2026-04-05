# CLAUDE.md — Snapora Essence

AI assistant guidance for the Snapora Essence codebase. Read this before making changes.

---

## Project Overview

Snapora Essence is a photobook creation platform. Users import photos (from device, cloud, or Apple Photos), arrange them into pages with flexible layouts, preview the book with a 3D flip animation, and order a physical book.

**Architecture:** Hybrid — React/TypeScript frontend (primary) + Python backend (Apple Photos extraction utility).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 (SWC compiler) |
| Styling | Tailwind CSS 3 + CSS Variables |
| UI primitives | shadcn/ui (Radix UI) |
| Routing | React Router v6 |
| State | React Context API + React Query 5 |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Testing (unit) | Vitest 3 + Testing Library |
| Testing (E2E) | Playwright |
| Linting | ESLint 9 + TypeScript ESLint |
| Python backend | Python 3 stdlib only (no external packages) |
| Package manager | npm (bun.lock also present as alternative) |

---

## Repository Structure

```
snapora-essence/
├── src/                          # React/TypeScript frontend
│   ├── pages/                    # Route-level page components
│   ├── components/               # Reusable React components
│   │   └── ui/                   # shadcn/ui primitives (54 files — do not hand-edit)
│   ├── context/                  # React Context providers
│   │   ├── BookContext.tsx        # Global book/project state
│   │   └── AuthContext.tsx        # Authentication state
│   ├── hooks/                    # Custom React hooks
│   ├── types/
│   │   └── book.ts               # All core TypeScript interfaces
│   ├── lib/
│   │   └── utils.ts              # cn() Tailwind class merger (only utility)
│   ├── test/                     # Vitest setup and example tests
│   ├── assets/                   # Static images/logos
│   ├── App.tsx                   # Router root
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles + CSS custom properties
│
├── apple-photos-intake/          # Standalone Python photo extractor
│   ├── src/                      # Extraction modules
│   ├── config/                   # Settings
│   └── main.py                   # CLI entry point
│
├── photo-extractors/             # Modular extractor framework
│   ├── apple-photos/             # Working Apple Photos extractor
│   └── google-photos/            # Planned (not implemented)
│
├── .lovable/
│   └── plan.md                   # Design system spec and implementation plan
│
├── CLAUDE.md                     # This file
├── README.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── eslint.config.js
```

---

## Development Workflows

### Frontend (daily workflow)

```bash
npm run dev        # Start dev server at http://localhost:8080
npm run build      # Production build
npm run build:dev  # Development build (with source maps)
npm run preview    # Preview production build locally
npm run lint       # ESLint check
npm run test       # Run Vitest (headless, single run)
npm run test:watch # Vitest watch mode
```

Vite serves on port **8080** bound to all interfaces (`::`) — not the default 5173.

### Python (Apple Photos extraction)

```bash
# From repo root or apple-photos-intake/
python main.py
# or
./run.sh
```

No external pip packages required — stdlib only.

### Testing

- Unit/component tests: `src/**/*.{test,spec}.{ts,tsx}` picked up automatically by Vitest
- E2E tests: Playwright config at `playwright.config.ts` (Lovable agent runner)
- Test setup file: `src/test/setup.ts`

---

## Key Conventions

### TypeScript

- Path alias `@` maps to `./src` — always use `@/components/...` not relative `../../`
- `allowJs: true`, no strict null checks — the codebase is lenient; don't add strict: true without discussion
- Core type definitions live in `src/types/book.ts` — add new shared types there, not inline

### Styling

- Use Tailwind utility classes; avoid inline `style={}` except for dynamic values (e.g., computed widths for 3D transforms)
- CSS custom properties for theming are defined in `src/index.css` using HSL — do not hardcode colors
- Dark mode is implemented via the `dark` class on `<html>`
- Design tokens: pure white background, deep charcoal text, navy accents, Inter font, 10px border radius, subtle shadows
- All pages are mobile-first and responsive

### Components

- shadcn/ui components live in `src/components/ui/` — **do not hand-edit these files**. Use the shadcn CLI to add or update components
- New application components go in `src/components/`
- Page components (one per route) go in `src/pages/`
- Use `cn()` from `@/lib/utils` for conditional class merging — not string concatenation

### State Management

- Global state lives in `BookContext.tsx` (book projects) and `AuthContext.tsx` (user/auth)
- Use React Query for any async/server data fetching
- Persistence: `localStorage` is used directly — no external DB or API backend exists yet
- Do not add Redux, Zustand, or other state libraries without discussion

### Forms

- All forms use React Hook Form + Zod for validation — follow this pattern consistently
- Do not use uncontrolled form elements

### Routing

- Routes are defined in `src/App.tsx`
- All page routes map 1:1 to files in `src/pages/`

---

## Page Layouts System

The layout system is central to the product. Understand it before touching editor code.

**Defined in:** `src/types/book.ts` (layout type union) and `src/components/PageLayoutRenderer.tsx` (rendering)

**16 layout types** — organized by photo count:

| Photos | Layout IDs |
|---|---|
| 1 | `full-bleed`, `matted`, `left-portrait` |
| 2 | `split`, `hero-detail`, `two-verticals` |
| 3 | `triptych`, `hero-stack`, `triple-vertical`, `vert-horiz-pair`, `landscape-top-two-vert` |
| 4 | `grid-2x2`, `hero-triptych` |
| 5 | `hero-right-stack`, `two-large-three-wide` |
| 6 | `grid-3x2`, `hero-mixed-stack` |

**Book dimensions:** A4 landscape (enforced). All layout math assumes 4K landscape aspect ratio.

**Style templates:** Classic, Baby Book, Yearbook, Wedding, Travel, Minimal — stored in `BookProject`.

---

## Core Data Models (`src/types/book.ts`)

```typescript
BookPhoto      // id, url, metadata
BookPage       // layoutType, photos[], captions, dateLabel, mapOverlay
BookProject    // id, title, pages[], styleTemplate, collaborators, status
OrderItem      // project + pricing, delivery status
User           // auth identity
Collaborator   // shared editing participant
```

---

## Python Photo Extractor

The Python backend is a standalone CLI utility — it does **not** connect to the React app at runtime.

**Entry points:**
- `main.py` (repo root) — delegates to `apple-photos-intake/`
- `apple-photos-intake/main.py` — direct entry point
- `photo-extractors/apple-photos/` — modular framework variant

**Key modules:**
- `photo_extractor.py` — queries Apple Photos SQLite DB, applies person/face filters
- `intake_workflow.py` — orchestrates the extraction pipeline
- `file_manager.py` — copies/moves files, manages output directories
- `permission.py` — handles macOS permission prompts
- `logger.py` — configures structured logging

**Output:** `test photo dump/` directory (gitignored)

**Planned extractors (not implemented):** Google Photos, Amazon Photos, Flickr — see `photo-extractors/README.md`

---

## What Not to Do

- **Do not edit `src/components/ui/` by hand** — these are shadcn/ui managed files
- **Do not add a backend API** without discussing the architecture first — the app currently uses localStorage
- **Do not change the Vite port (8080)** — it is intentionally non-default
- **Do not add external Python packages** to the extractor — stdlib only by design
- **Do not hardcode layout dimensions** — all sizing derives from the A4 landscape constraint
- **Do not use `style={{ color: '...' }}`** for theme colors — use Tailwind classes and CSS variables
- **Do not add CI/CD config files** without discussion — no CI pipeline exists yet

---

## Git Workflow

- **Active feature branch:** `claude/add-claude-documentation-vs3UE`
- **Main branch:** `main`
- Remote: `http://local_proxy@127.0.0.1:44863/git/vkrmlakhotia-lab/snapora-essence`
- Push with: `git push -u origin <branch-name>`
- Commit messages follow plain imperative style (e.g., "Add layout renderer for 5-photo pages")

---

## No Environment Variables

There are no `.env` files and no `process.env` usage in the frontend. The Python extractor uses `config/settings.py` for configuration. If you need to add environment variables, discuss first.

---

## Lovable Integration

This project was scaffolded with [Lovable](https://lovable.dev). The `.lovable/plan.md` file contains the authoritative design system spec and feature implementation plan. Consult it for design decisions. The `lovable-tagger` package adds component metadata used by the Lovable platform.
