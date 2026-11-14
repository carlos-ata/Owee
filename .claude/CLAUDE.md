# Owee — AI agent guide

> Debt-tracking API with a social layer: each person records what they owe or are owed,
> sees their balance against each contact, and settles debts with payments. State is
> shared, not local — any movement involving two people needs the counterparty's
> confirmation.

This file is the index. Full rules live in `.claude/docs/`, audit findings in
`.claude/audits/`, and executable procedures in `.claude/skills/`. **Read the relevant
doc before writing code** — don't improvise on the structure.

| I need to… | Read |
|---|---|
| Understand layers, dependencies, and request flow | [docs/architecture.md](docs/architecture.md) |
| File names, imports, errors, responses, TS rules | [docs/conventions.md](docs/conventions.md) |
| Know what's broken before touching something | latest file in [audits/](audits/) |

| I want to… | Skill |
|---|---|
| Create a full new module | `owee-module` |
| Add an endpoint to an existing module | `owee-endpoint` |
| Document endpoints in Swagger | `swagger-endpoint-docs` |
| Change the data model (Prisma 8) | `prisma-contract-change` |
| Audit code against these rules | `owee-review` |

The reference module is **`src/modules/debt/`**. When unsure about a structure, copy it
from there (except for points listed in `audits/findings.md`).

## Stack (actual versions — don't assume others)

- **Node ESM** (`"type": "module"`) + **TypeScript 7** (`strict`, `noEmit`)
- **Express 5**
- **Prisma ORM 8** (`8.0.0-rc.x`, *contract* API via `db.orm.public.<Model>`) on **PostgreSQL ≥ 15**
- **Better Auth 1.7** (email + password, session cookie)
- **Awilix 13** (`InjectionMode.PROXY`, `strict: true`)
- **Zod 4** for input validation
- **swagger-jsdoc** + **swagger-ui-express** for documentation
- **@hapi/boom** for normalized errors
- **pnpm** is mandatory (`devEngines` rejects npm)

## Hard rules (violating these is a bug, not a style preference)

1. **`domain/` imports nothing from `application/` or `infrastructure/`.** Not even types.
2. **`application/` (use cases) knows nothing about Express, Prisma, Zod, or Better Auth.**
   Only entities, repository interfaces, and application DTOs.
3. **A use case receives and returns domain/DTO objects, never `req`, `res`, or DB rows.**
4. **Every mapping is a pure function in its own file.** One mapper = one file = one
   direction. Inline mapping inside a controller, use case, or repository is forbidden.
5. **Money amounts are `string` in every layer.** Never `number` or `float`.
6. **Dates are ISO 8601 `string`** (the contract uses `TimestamptzString`).
7. **Every route that operates on a user's data carries `authenticate`**, and identity is
   read from `res.locals.user` — never from the body or the query.
8. **Authorization is decided in the use case**, not in the router or the repository.
9. **The router validates with Zod exactly the part of the request the controller
   reads** (`params` → `req.params`, `body` → `req.body`).
10. **Every class registered in the container must appear in the `Cradle` interface.**
11. **Forbidden by `erasableSyntaxOnly: true`:** parameter properties
    (`constructor(private x)`), `enum`, `namespace`. Assign fields explicitly in the
    constructor, as the rest of the codebase already does.
12. **`verbatimModuleSyntax: true`:** type-only imports use `import type`.
13. **Internal imports use the `#` aliases from `package.json` and end in `.js`**
    (never long relative paths; never `.ts` in the specifier).
14. **After changing `contract.prisma`:** run `pnpm prisma contract emit` and commit
    `contract.json` + `contract.d.ts`.
15. **No new dependency without asking first.** The stack above is the stack.

## Commands

```bash
pnpm dev                            # tsx watch src/server.ts
pnpm prisma contract emit           # regenerate contract.json + contract.d.ts
./node_modules/.bin/tsc --noEmit    # typecheck (the only "test" available today)
```

Live docs: `http://localhost:3000/api/v1/docs`

> `npx`/`npm run` fail with `EBADDEVENGINES`. Use `pnpm`, or call the local binary
> directly (`./node_modules/.bin/<bin>`).

## Before saying you're done

- [ ] `./node_modules/.bin/tsc --noEmit` with no new errors
- [ ] No hard rule violated
- [ ] New endpoints documented with the `swagger-endpoint-docs` skill
- [ ] If the contract changed: `contract emit` has run
- [ ] A bug found outside your scope is logged in a new timestamped file under `audits/`

## What this guide is not for

Domain/business rules (debt lifecycle, confirmation semantics, balances, payments) are
not documented here — don't write them into `.claude/`. When implementing a feature,
ask the user for the actual rule instead of assuming or inventing one. Never volunteer
that a feature is "missing" from the app; only raise it when asked for an opinion.
