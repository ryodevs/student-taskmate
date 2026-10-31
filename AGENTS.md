# TaskMate

Student task manager. React 18 + TypeScript + Vite, client-only, deployed on Vercel from `main`. Data lives in localStorage; there is no backend.

## Commands

- `npm run dev` - dev server at http://localhost:5173
- `npm run build` - typecheck (`tsc`) then production build
- `npm run lint` - Oxlint, including the vendored anti-slop rules
- `npm run preview` - preview the production build

There is no test runner yet. Do not claim tests pass; add one only when requested.

## Project rules

- Keep changes small and scoped. Do not refactor or reformat unrelated code.
- Do not add dependencies or UI frameworks without asking first.
- Keep persistence in `src/lib/storage.ts`. Do not add direct `localStorage` calls in pages or components.
- Keep business rules in `src/lib/*`; pages and components consume them. Do not duplicate deadline, task, auth, summarizer, or converter logic in UI.
- Reuse the CSS variables and classes in `src/styles/global.css`. Do not introduce a second styling system.
- Auth and Google login are demo-only and client-side. Never present them as production security, and never commit secrets.
- Do not commit `node_modules/`, `dist/`, `.env*`, or `.vercel`.
- Run `npm run build` and `npm run lint` before reporting completion.
- Comments: explain why, never restate the code.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `.opencode/skills/antislop/SKILL.md`
- UI / visual: `.opencode/skills/antislop-ui/SKILL.md`
- Copy & text: `.opencode/skills/antislop-copywriting/SKILL.md`
- People: `.opencode/skills/antislop-human/SKILL.md`
- Mobile / responsive: `.opencode/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `.opencode/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->
