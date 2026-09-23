# todo-app

Practice project for learning Claude Code end-to-end, built as part of a step-by-step learning roadmap. Simple todo/task manager: REST API + minimal web UI.

## Stack

- Node.js + TypeScript (strict mode)
- Express (planned, stage 06) for the API
- Vitest for tests
- tsx for running TypeScript directly in development

## Scripts

- `npm run dev` — run src/index.ts with auto-restart on change
- `npm run build` — compile to dist/
- `npm test` — run the test suite (Vitest)
- `npm run typecheck` — type-check without emitting files

## Conventions

- See the global CLAUDE.md for TDD and commit-splitting conventions — they apply here too.
- Source lives in `src/`; compiled output goes to `dist/` (gitignored).
