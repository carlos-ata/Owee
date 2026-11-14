---
name: owee-review
description: Audits Owee code against the project's hexagonal architecture rules, conventions, and HTTP/type-safety correctness. Use it when asked to review, audit, or validate changes, before closing out a batch of work, or when asked "is this done right?" / "does this follow the architecture?".
---

# Auditing code against Owee's rules

Project-specific review. For generic bugs use `/code-review`; this skill looks for
**violations of Owee's own rules**, which a generic reviewer doesn't know about.

This skill does not check business/domain correctness (whether a rule like "who can
confirm a debt" is right) — that's for the user to define. It checks architecture,
types, HTTP contracts, and internally-inconsistent code (a check that can never fail, a
type that contradicts its own implementation, dead code).

Default scope: files touched in the conversation. If asked to review "the whole repo",
go module by module through `src/modules/**`.

## Pass 1 — Cross-layer dependencies

Violations show up in the imports. Useful commands:

```bash
# domain can't import anything from outside the domain
grep -rn "^import" src/modules/*/domain/ | grep -E "application|infrastructure|zod|express|@prisma|better-auth"

# application knows no technology
grep -rn "^import" src/modules/*/application/ | grep -E "express|zod|@prisma|better-auth|infrastructure"

# use cases never import each other across modules
grep -rn "use-case" src/modules/*/application/use-cases/
```

- [ ] `domain/` has no imports from `application/`, `infrastructure/`, zod, express, prisma
- [ ] `application/` has no express, zod, prisma, better-auth imports
- [ ] Cross-module access only through repository interfaces and entities
- [ ] No controller imports a repository or `#prisma/db.js`
- [ ] No repository imports a use case

## Pass 2 — Responsibilities

- [ ] **Controller**: mapper → use case → `res.success`, wrapped in `try/catch` +
      `next(error)`. No business `if`, no building entities, no validation.
- [ ] **Use case**: one action, one `execute`; validations in order existence → state →
      authorization → business rule; throws via `error.*`.
- [ ] **Entity**: private constructor; `create`/`reconstitute`/static transitions;
      `new Date().toISOString()` only here.
- [ ] **Repository**: no rules, no HTTP errors; reads return `| null`.
- [ ] **Mapper**: pure function in its own file, no `await`, no business `if`, typed on
      both ends.
- [ ] No inline mapping outside a mapper file.

## Pass 3 — HTTP and contracts

- [ ] The request part the router validates is the same one the controller reads
      (`params` ↔ `req.params`) — this is a recurring bug class.
- [ ] Path/query ids use `z.coerce.number()`, never `z.number()`.
- [ ] `authenticate` on every route touching user data, placed before `validation`.
- [ ] Identity comes from `res.locals.user`, never from the body or query.
- [ ] `res.success(...)` always; zero `res.json(...)` in controllers.
- [ ] `data` comes from a typed response DTO, not the entity.
- [ ] No sensitive field exposed (`password`, other users' data).
- [ ] Every route has its `@openapi` block, matching the real Zod schema and DTO.

## Pass 4 — TypeScript and type-level consistency

- [ ] A repository's return type matches what it actually does (no `Promise<X>`
      claimed while the implementation throws instead of returning, or narrows a port's
      `| null`)
- [ ] No parameter properties, `enum`, or `namespace` (`erasableSyntaxOnly`)
- [ ] `import type` for type-only imports
- [ ] `#` aliases with `.js` suffix; no long relative paths
- [ ] No `any` outside infrastructure; no `!` in domain/application
- [ ] File names carry the right suffix and `<entity>-<action>` order
- [ ] Classes use `export default`; mappers/schemas/DTOs use named exports
- [ ] Routers are factories receiving the controller
- [ ] Every registered class appears in `Cradle`
- [ ] No commented-out code, no orphan mappers/methods, no interface that no longer
      matches what the function next to it returns

## Pass 5 — Logical sanity

A check that always evaluates one way for its only realistic caller is not a safeguard.
Flag:
- [ ] Authorization checks that compare an actor against the same value that actor just
      set two lines earlier (self-referential guards that can't reject the common case)
- [ ] A value validated once by a middleware, then re-validated by hand in the
      controller because the first validation's result was never used
- [ ] Code reachable only when a condition the type system says is impossible occurs
      (dead `if (!x) throw` guards after a call whose return type can't be null)

## Pass 6 — Verification

```bash
./node_modules/.bin/tsc --noEmit
```

- [ ] No new errors
- [ ] If the contract changed: `pnpm prisma contract emit` ran and artifacts are committed
- [ ] Endpoints visible at `/api/v1/docs`

## How to report

Group by severity, be concrete: file, line, which rule, the fix.

```
🔴 BUG — src/modules/debt/.../debt.controller.ts:45
The router validates `params` but the controller reads `req.body`: the id never arrives.
→ `debtIdentityToDomainMapper(req.params)`

🟠 ARCHITECTURE — src/modules/debt/.../pgsql-debt.repository.ts:42
The repository throws `error.notFound`; the port declares `Promise<Debt | null>`.
→ return `null` and let the use case decide.
```

- Don't invent problems to pad the report. If a pass comes back clean, say so.
- Don't flag something already tracked in the most recent file under `.claude/audits/`
  — reference the finding (F1…Fn) instead of repeating it.
- Never report that a feature is missing (no payments module, no list endpoint, etc.) —
  that's a product decision, not an audit finding. Only mention it if asked for an
  opinion.
- Every audit is a **new file**, never an overwrite of a previous one. Create
  `.claude/audits/<YYYY-MM-DD_HH-MM>-findings.md` (get the real timestamp from the
  system, don't guess it) and write the report there, in English, following the format
  of the most recent existing file in that folder. Older files stay as history.
