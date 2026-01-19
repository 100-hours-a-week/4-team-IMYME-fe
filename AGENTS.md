# AGENTS.md — Frontend Design Guideline (Codex Rules)

Codex must follow these frontend design principles when creating or editing frontend code.
Prioritize: Readability > Predictability > Cohesion > Coupling.

If a change violates these rules, refactor to comply before finishing.

---

## Global Rules (Always)

### Readability

1. **No magic numbers.**
   - Replace unexplained numeric literals with named constants.
   - Name constants to reveal intent (e.g., `ANIMATION_DELAY_MS`).

2. **Abstract complex interactions.**
   - Move non-trivial flows (auth gating, dialogs, async interaction sequences) into dedicated components/hooks.
   - Keep page components focused on layout + orchestration.

3. **Split diverging conditional UI into components.**
   - If conditional branches differ significantly (UI + side effects + logic), create separate components per branch.

4. **Avoid complex/nested ternaries.**
   - Use `if/else` or an IIFE for multi-branch status computation.

5. **Colocate small logic near usage.**
   - Prefer inline switch/policy objects for simple role/permission rendering.
   - Reduce “eye movement” by keeping logic near the UI it affects.

6. **Name complex boolean conditions.**
   - Extract complex predicates into well-named variables.

### Predictability

7. **Standardize return shapes for similar utilities/hooks.**
   - React Query hooks should return the `UseQueryResult` object consistently.
   - Validation functions should return a discriminated union like:
     - `{ ok: true } | { ok: false; reason: string }`

8. **Avoid hidden side effects (SRP).**
   - Functions should do what their name/signature implies; separate fetch/log/sync responsibilities.

9. **Use unique, descriptive wrapper names.**
   - If wrapping libraries, name functions to reveal behavior (e.g., `getWithAuth` instead of `get`).

### Cohesion

10. **Keep related code together.**

- Organize by feature/domain (preferred) rather than only by type.
- Constants should live near the logic they relate to (or be clearly named).

11. **Form cohesion policy**

- Use field-level validation for independent fields / async checks / reusable fields.
- Use form-level schema validation for interdependent fields / wizards.

### Coupling

12. **Avoid premature abstraction.**

- Do not merge duplicates into shared abstractions if future divergence is likely.

13. **Scope state management narrowly.**

- Prefer small focused hooks over broad “god hooks”.
- Components should depend only on the state slice they need.

14. **Prefer composition over props drilling.**

- Avoid passing props through intermediates when composition can remove the middle layer.

---

## When Editing Code

- Preserve existing patterns unless they violate the rules above.
- If you introduce new patterns (hooks/components), keep naming explicit and consistent.
- For any non-trivial refactor: explain why the change improves readability/predictability.

---

## Minimal Examples (reference)

- Magic number → `const X_MS = 300`
- Complex conditional → separate components
- Validation result → `{ ok: true } | { ok: false; reason: string }`

---

## Architecture (Must)

1. `app/` is routing entry ONLY

- Keep `app/` minimal: `layout.tsx`, `page.tsx`, `route.ts`, metadata.
- Move UI/business logic into `src/pages|widgets|features|entities|shared`.

2. Enforce FSD layer direction

- Allowed: `app -> pages -> widgets -> features -> entities -> shared`
- Forbidden: lower layers importing upper layers
- Forbidden: cross-slice imports within the same layer

3. Public API imports only

- Each slice exports via `index.ts`
- Prefer `@/entities/user`, `@/features/auth` (avoid deep imports)

4. Server/Client component separation

- `ui/client` must include `"use client"`
- `ui/server` must not use hooks (`useState/useEffect`), `window/document`, or browser-only APIs
- Client must not import server components

## Quality Gates (Must)

- Before finishing: `pnpm lint` and `pnpm build` must pass (plus `typecheck/test` if available)

## Git Workflow (Must)

- Never commit directly to `main` or `dev`
- Use branches: `feat/*`, `fix/*`, `refactor/*`, `chore/*`, `docs/*`
- PR: `dev <- feature branches`, `main <- dev` (release)
- Conventional commits: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
