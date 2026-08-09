# XC2 Blade Combo Planner

A Xenoblade Chronicles 2 blade combo planner — configure your party's elements and get a real-time tree of feasible combo routes with the best picks recommended.

🔗 **Live demo:** <https://ahaoboy.github.io/xb2/>

## Features

- **Party management** — 1-3 characters, each with 3 element slots; slots can be disabled (e.g. characters with only 1-2 blade slots)
- **Auto-fill** — configure only some slots, then compute the best element for every remaining empty slot with one click
- **Route trees** — horizontal mermaid-style trees grouped by starting element, showing the attack name and damage multiplier for every stage
- **Recommended paths** — each tree's best route is marked with a ⭐, scored by element variety, driver assignment, and orb detonation potential
- **Seal filtering** — filter routes by the resulting seal effect
- **Dark mode** — System / Light / Dark, follows the browser by default
- **i18n** — 简体中文 / English, follows the browser language by default

## Tech Stack

- React 19 + TypeScript
- Vite 8
- MUI (Material UI v9, CSS variables)
- zustand (state management, persisted to localStorage)
- i18next + react-i18next

## Getting Started

```bash
pnpm install
pnpm dev        # start the dev server
pnpm build      # type-check + production build (outputs to dist/)
pnpm lint       # lint (oxlint)
pnpm pre-check  # format + autofix (oxfmt + oxlint --fix)
```

## Deployment

Production builds externalize dependencies to the esm.sh CDN and are published to GitHub Pages:

```bash
NODE_ENV=production pnpm build
```

The `base` in `vite.config.ts` switches by environment:

- Local dev: root path `/`
- Production: `https://ahaoboy.github.io/xb2/`

## Project Structure

```
src/
├── components/        # UI components (header / characters / routes / elements)
├── data/              # Static data (elements, combo routes, combo attacks)
├── hooks/             # Custom hooks
├── i18n/              # i18n setup and locale files
├── store/             # zustand stores (characters, settings)
├── theme/             # MUI theme (light & dark schemes)
├── types/             # Domain types
└── utils/             # Business logic (combo calculation, auto-fill)
```

## Data Source

Combo route and attack data is transcribed from the blade combo chart at [xenoblade2.cn](https://xenoblade2.cn).
