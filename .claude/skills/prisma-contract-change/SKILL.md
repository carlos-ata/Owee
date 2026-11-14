---
name: prisma-contract-change
description: Changes Owee's data model with Prisma ORM 8 (contract.prisma, contract emit, migration plan, db migrate) and propagates the change to types, mappers, and entities. Use it when adding or changing a model, column, index, enum, or @@check, or when asked for "a new table", "add a field", or "migrate the database".
---

# Changing the data model (Prisma ORM 8)

Prisma 8 (RC) **doesn't use `schema.prisma` or `prisma generate`**. The model is
declared in a *contract* and compiled into artifacts that get committed.

```
src/infrastructure/database/prisma/
├── contract.prisma   ← hand-EDITED (source of truth)
├── contract.json     ← GENERATED, committed
├── contract.d.ts     ← GENERATED, committed
└── db.ts             ← client: postgres<Contract>({ contractJson, url })

prisma.config.ts      ← points to the contract and to config.dataBaseUrl.owee
migrations/           ← migration packages + contract snapshots (generated)
better-auth_migrations/ ← SQL emitted by Better Auth; never hand-write this
```

> `npm`/`npx` fail in this repo (`EBADDEVENGINES`). Use `pnpm prisma …` or
> `./node_modules/.bin/prisma …`.

## Procedure

### 1. Edit `contract.prisma`

Owee's contract conventions — follow them:

- **Model in `PascalCase` singular**, table in `snake_case` via `@@map("debt")`.
- **Field in `camelCase`**, column in `snake_case` via `@map("creator_id")`.
  (Better Auth's models — `user`, `account`, `session`, `verification` — are the
  exception: the library owns those names, don't touch them.)
- **Money:** `Numeric(12, 2)` + `@@check(expression: sql`amount > 0`, name: "…_amount_positive")`.
- **Dates:** `TimestamptzString` (arrives in code as `string`, never `Date`).
- **Ids:** `Int @id @default(autoincrement())` for business entities; `String @id` for
  Better Auth models.
- **Enums:** declared in the contract with `@@type("pg/text@1")` — but in TypeScript
  **never** use `enum` (forbidden by `erasableSyntaxOnly`): map it to a literal union in
  the entity.
- **Index every FK** (`@@index([creatorId])`) and `@@unique` where the business needs
  it.
- **Invariants are expressed as named `@@check`s.** The database is the last line of
  defense: any rule expressible in SQL belongs there too, even if the use case already
  validates it.

### 2. Regenerate the artifacts

```bash
pnpm prisma contract format      # normalize the PSL
pnpm prisma contract emit        # regenerate contract.json and contract.d.ts
```

Commit **all three** files (`contract.prisma`, `contract.json`, `contract.d.ts`). Skip
`emit` and the runtime keeps using the old model while the types lie about it.

### 3. Plan and apply the migration

```bash
pnpm prisma migration plan       # derive the migration from the contract change
pnpm prisma migration status     # what's still pending
pnpm prisma db migrate           # apply it to the database
pnpm prisma db verify             # confirm the database matches the contract
```

`pnpm prisma db init` only for an empty database; `pnpm prisma db update` pushes the
contract with no migration package (**local development only**).
`pnpm prisma contract infer` does the reverse: derives PSL from a live database — useful
for reconciling whatever Better Auth created on its own.

**Before applying against a database with data**, review the plan: a `NOT NULL` column
with no default on a populated table will fail, and a renamed column becomes a `DROP` +
`ADD` (data loss) unless declared as a rename.

### 4. Propagate the change through the code — not optional

A contract change does **not** end at the database. Walk through, in this order:

| # | File | What to update |
|---|---|---|
| 1 | `modules/<m>/infrastructure/repositories/types/<x>.types.ts` | the row shape (`Prisma<X>Row`) |
| 2 | `modules/<m>/domain/entities/<x>.entity.ts` | `<X>Props`, `New<X>Data`, class fields, statics |
| 3 | `.../repositories/mappers/<x>-to-domain.mapper.ts` | map the new field |
| 4 | `.../repositories/mappers/*-to-db.mapper.ts` | send the new field |
| 5 | `modules/<m>/application/dto/*.dto.ts` | if the field comes through the API |
| 6 | `.../http/schemas/*.schema.ts` | Zod validation for the field |
| 7 | `.../http/mappers/*-to-domain.mapper.ts` | flattening |
| 8 | `.../http/dto/*-response.dto.ts` | if the field is exposed |
| 9 | `src/infrastructure/docs/schemas/<m>.docs.ts` | OpenAPI schema |
| 10 | use cases | any new rule the field enables |

`./node_modules/.bin/tsc --noEmit` is your task list: generated types will fail
anything you didn't propagate. **Fix the error in the right layer**, not with a cast.

### 5. Verify

```bash
pnpm prisma db verify
./node_modules/.bin/tsc --noEmit
pnpm dev
```

## Client API (Prisma 8)

```ts
db.orm.public.Debt.where({ id }).first()
db.orm.public.Debt.where({ debtorId }).all()
db.orm.public.Debt.create({ /* flat payload */ })
db.orm.public.Debt.where({ id }).update({ /* fields */ })
db.orm.public.Session.where({ token }).deleteAll()
```

The client arrives by injection (`deps.db`), never by direct import inside a method. If
an RC API doesn't exist or has changed, don't guess — check `contract.d.ts`, which is
the real definition of what's available.

## Notes on the RC

- Pinned versions: `@prisma/orm-postgres@8.0.0-rc.18`, `prisma@8.0.0-rc.23`,
  `@prisma/cli-engine@0.6.2`. Don't bump them without asking — APIs shift between RCs.
- The CLI mentions official Prisma skills for agents (`pnpm prisma skills sync`).
  Installing them is reasonable, but **ask first** — it writes files inside `.claude/`.
- `better-auth_migrations/` is generated by Better Auth. If you change user fields, do
  it in `user.additionalFields` in `src/infrastructure/auth/auth.ts` and let the
  library emit its own SQL; then reconcile the contract with `contract infer`.

## What not to do

- Hand-edit `contract.json` or `contract.d.ts`.
- Forget `contract emit` after touching the contract.
- Add a money column that isn't `Numeric(12,2)` with its positivity `@@check`.
- Use `DateTime`/`Date` instead of `TimestamptzString`.
- Physically delete business records: use `status = "I"`.
- Silence a type error with `as any` instead of propagating the change.
