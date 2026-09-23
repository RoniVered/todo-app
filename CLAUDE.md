# todo-app

Practice project for learning Claude Code end-to-end, built as part of a step-by-step learning roadmap. Simple todo/task manager: REST API + minimal web UI.

## Stack

- Node.js + TypeScript (strict mode)
- Express (planned, stage 06) for the API
- Vitest for tests
- tsx for running TypeScript directly in development
- ESLint (flat config, `eslint.config.mjs`) with typescript-eslint for linting

## Scripts

- `npm run dev` — run src/index.ts with auto-restart on change
- `npm run build` — compile to dist/
- `npm test` — run the test suite (Vitest)
- `npm run typecheck` — type-check without emitting files
- `npm run lint` — run ESLint

## Conventions

- See the global CLAUDE.md for TDD, code-quality-checks, and commit-splitting conventions — they apply here too.
- Source lives in `src/`; compiled output goes to `dist/` (gitignored).
- **TypeScript is pinned to `6.0.3`, not the latest major (7.x)**: `typescript-eslint`'s latest release only supports TypeScript `<6.1.0` as a peer dependency. Don't bump TypeScript past `6.0.x` without checking typescript-eslint's supported range first, or lint will break.
