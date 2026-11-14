# Architecture — Owee

Hexagonal architecture (ports and adapters) per module, on top of Express 5 and
Awilix. This document defines **what file can import what** and **how a request
flows**. If a new piece doesn't fit this map, it's in the wrong place.

---

## 1. Folder map

```
src/
├── app.ts                  # Express wiring: cors, json, docs, routes, error middlewares
├── server.ts               # listen() only — nothing else lives here
├── config/
│   ├── .env                # NOT committed
│   └── config.ts           # the only place in the project that reads process.env
├── domain/
│   └── errors/app-error.ts # CustomError + the `error.*` factory shared by every module
├── infrastructure/         # CROSS-CUTTING infrastructure (not module-specific)
│   ├── auth/auth.ts        # Better Auth instance
│   ├── container/container.ts
│   ├── database/prisma/    # contract.prisma, contract.json, contract.d.ts, db.ts
│   ├── docs/swagger-options.ts
│   ├── middleware/         # auth, error, not-found, response, validation
│   └── shared/
├── modules/
│   ├── auth/
│   ├── debt/               # ⭐ reference module
│   └── hello-world/        # example scaffold, not wired up
└── routes/
    └── v1/index.ts         # the single place where v1 routers get mounted
```

### Anatomy of a module

```
modules/<module>/
├── domain/                                   # the center: imports NOTHING from outside the module
│   ├── entities/<x>.entity.ts                # class + props/data interfaces + domain types
│   └── repositories/<x>.repository.ts        # PORT: interface I<X>Repository
├── application/                              # orchestration, no technology
│   ├── dto/<action>.dto.ts                   # internal contract: what the use case accepts
│   └── use-cases/<action>.use-case.ts        # one class = one action = one execute() method
└── infrastructure/                           # ADAPTERS
    ├── http/                                 # inbound adapter
    │   ├── <module>.router.ts                # routes + middlewares + validation
    │   ├── <module>.controller.ts            # injected by Awilix; only translates HTTP ↔ use case
    │   ├── schemas/<action>.schema.ts        # Zod: validates the request. `z.infer` is the type source
    │   ├── mappers/<action>-to-domain.mapper.ts   # Schema (flat JSON) → application DTO
    │   └── dto/<action>-response.dto.ts      # Domain → response JSON (frozen per API version)
    └── repositories/                         # outbound adapter
        ├── pgsql-<module>.repository.ts      # implements the domain port
        ├── mappers/<action>-to-db.mapper.ts  # Domain → Prisma payload
        ├── mappers/<x>-to-domain.mapper.ts   # DB row / Better Auth → domain entity
        └── types/<x>.types.ts                # shape of whatever the ORM / raw query / Better Auth returns
```

---

## 2. Dependency rule

```
            ┌──────────────────────────────────────────┐
            │              infrastructure              │
            │   http/ (inbound)      repositories/      │
            └───────┬───────────────────────┬──────────┘
                    │ imports               │ imports
                    ▼                       ▼
            ┌──────────────────────────────────────────┐
            │               application                │
            │          use-cases/ + dto/               │
            └────────────────────┬─────────────────────┘
                                 │ imports
                                 ▼
            ┌──────────────────────────────────────────┐
            │                 domain                   │
            │   entities/ + repositories/ (interfaces) │
            └──────────────────────────────────────────┘
```

Arrows point **downward only**. Concretely:

| File | May import | Never imports |
|---|---|---|
| `domain/entities/*` | nothing (not even infra libraries) | application, infrastructure, zod, prisma, express |
| `domain/repositories/*` | `domain/entities/*` | everything else |
| `application/dto/*` | domain types from the same module | zod, prisma, express |
| `application/use-cases/*` | `domain/*` from any module, `application/dto/*`, `#domain/errors` | express, zod, prisma, better-auth |
| `infrastructure/http/schemas/*` | `zod` | everything else |
| `infrastructure/http/mappers/*` | schema type + DTO type | entities, prisma |
| `infrastructure/http/dto/*` | domain entities | zod, prisma |
| `infrastructure/http/controller` | use cases (as `import type`), mappers, DTOs, express | prisma, repositories, entities to build them |
| `infrastructure/repositories/*` | domain port, entities, `#prisma/db.js`, mappers, types | express, zod, use cases |

**Cross-module access:** allowed **only** through `domain/repositories` (ports) and
entities. `DebtCreateUseCase` depends on `IAuthRepository`, not on
`PgSqlAuthRepository` or auth's controller. Never import a use case from another module
inside a use case.

---

## 3. Request flow (real example: `POST /api/v1/debt`)

```
HTTP
 │
 ├─ app.ts ──────────────── cors → express.json → responseExtender → /api/v1
 │
 ├─ routes/v1/index.ts ──── router.use("/debt", createDebtRouter(container.resolve("debtController")))
 │
 ├─ debt.router.ts ──────── authenticate                  ← sets res.locals.user
 │                          validation({ body: debtCreateSchema })   ← Zod; 400 on failure
 │                          controller.createDebt
 │
 ├─ debt.controller.ts ──── debtCreateToDomainMapper(req.body)  → DebtCreateDTO
 │                          useCase.execute(res.locals.user, dto)
 │                          res.success(debtGenericToResponseMapper(debt), 201)
 │
 ├─ debt-create.use-case ── authRepository.findById(...)   ← business validations
 │                          Debt.create({...dto, creatorId: user.id})  → NewDebtData
 │                          debtRepository.create(newDebt)
 │
 ├─ pgsql-debt.repository ─ debtCreateToDbMapper(data)
 │                          db.orm.public.Debt.create(...)
 │                          debtToDomainMapper(row) → Debt
 │
 └─ response ─────────────── { statusCode: 201, data: { id }, error: null }
```

If something throws: `next(error)` → `logErrors` → `wrapErrors` (normalizes to Boom) →
`errorHandler` (serializes). See `conventions.md §4`.

### Who does what (and what they must NOT do)

- **Router** — declares method, path, middlewares, and the validation schema. Zero logic.
- **Controller** — translates HTTP to a use case call and back. One `try/catch` that
  calls `next(error)`. **Does not validate, does not decide permissions, does not build
  entities, does not talk to the repository.**
- **Use case** — one single action. Checks existence, authorization, and business
  rules; uses the entity's static methods to produce data; calls repositories through
  their interface. **The only place a business rule may live.**
- **Entity** — invariants and state transitions. Private constructor; created with
  `static create()` (new data), rehydrated with `static reconstitute()` (existing
  data), transitioned with `static confirm()` / `cancel()` / `settle()`.
- **Repository (adapter)** — SQL/ORM, nothing else. Translates domain ↔ row. **Does not
  decide permissions or rules.**
- **Mapper** — pure function, no business `if`, no `await`.

---

## 4. Dependency injection (Awilix)

`src/infrastructure/container/container.ts` is the **only** place where classes get
instantiated. `PROXY` mode + `strict: true`: every class receives **a single argument**
`deps` and reads its dependencies from it by name.

Mandatory pattern for any injectable class:

```ts
interface Deps {
  debtRepository: IDebtRepository;   // by interface, not by implementation
}

export default class DebtCancelUseCase {
  private readonly debtRepository: IDebtRepository;

  constructor(deps: Deps) {            // ← a single parameter named deps
    this.debtRepository = deps.debtRepository;
  }
}
```

Don't use parameter properties (`constructor(private deps)`): `erasableSyntaxOnly`
forbids it.

Adding a class means touching **three** things in `container.ts`:

1. the `import`,
2. the property in the `Cradle` interface,
3. the `container.register({ ... })` entry with `asClass(X).singleton()`.

Already-built values (`db`, `auth`) are registered with `asValue`.
The registration name is the **camelCase of the class name without its technology
prefix**: `PgSqlDebtRepository` → `debtRepository`, `ExpressDebtController` →
`debtController`, `DebtCreateUseCase` → `debtCreateUseCase`.

> `authenticate` (`infrastructure/middleware/auth.ts`) resolves from the container
> directly because it's a global middleware, not an injected class. It is the **only**
> allowed exception to "don't use the container as a service locator."

---

## 5. API versioning

- `routes/v1/index.ts` mounts every v1 router. `app.ts` exposes it at `/api/v1`.
- A **v2** is created as `routes/v2/index.ts` + `app.use("/api/v2", v2Routes)`.
- **Modules are NOT duplicated per version.** What gets duplicated per version is the
  `infrastructure/http/` folder (schemas, mappers, dto, controller, router) when the
  external contract changes. Domain, application, and repositories are shared.
- That's why **response DTOs exist**: they isolate the shape of the public JSON from
  the shape of the entity, so the domain can change without breaking v1 clients. Never
  return an entity directly, even if its shape "happens to match."

---

## 6. Database (Prisma 8)

- The data contract is `src/infrastructure/database/prisma/contract.prisma`.
- `contract.json` and `contract.d.ts` are **generated** — committed, never hand-edited.
- The client comes from `#prisma/db.js` and is queried through the Prisma 8 API:
  `db.orm.public.Debt.where({ id }).first()`, `.create(...)`, `.update(...)`, `.deleteAll()`.
- `db` reaches repositories **by injection** (`deps.db`), never by direct import inside
  a method.
- Row types are hand-declared in `infrastructure/repositories/types/*.types.ts` to
  avoid coupling the mapper to generated types.
- See the `prisma-contract-change` skill for the full procedure.
