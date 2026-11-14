---
name: owee-module
description: Creates a new hexagonal module under src/modules in Owee (e.g. payment, balance, contact, notification), with domain, application, infrastructure, import aliases, container registration, and mounting in routes/v1. Use it when asked for "a new module", "the payments part", "the X entity", or an API resource that doesn't exist yet.
---

# Creating a new module

An Owee module is a vertical slice of the domain with its own ports and adapters. The
reference module is `src/modules/debt/`.

Before starting, read `.claude/docs/architecture.md` (structure and dependencies). This
skill doesn't define business rules for the new module — ask the user for the actual
entity fields, states, and invariants rather than inventing them.

## 0. Pick the name

Singular, kebab-case, matching the HTTP resource: `payment`, `balance`, `contact`. The
module is named after its main entity, not after an action.

## 1. Skeleton

```
src/modules/<m>/
├── domain/
│   ├── entities/<m>.entity.ts
│   └── repositories/<m>.repository.ts
├── application/
│   ├── dto/
│   └── use-cases/
└── infrastructure/
    ├── http/
    │   ├── <m>.router.ts
    │   ├── <m>.controller.ts
    │   ├── schemas/
    │   ├── mappers/
    │   └── dto/
    └── repositories/
        ├── pgsql-<m>.repository.ts
        ├── mappers/
        └── types/
```

Create only the folders you're actually filling; don't leave empty directories.

## 2. Import alias

In `package.json`, inside `imports`:

```json
"#<m>/*": "./src/modules/<m>/*"
```

Keep the existing order (module aliases go last). From inside the module, always use
its short alias.

## 3. Entity

```ts
export interface PaymentProps { /* every field, as it comes from the DB */ }
export interface PaymentCreateProps { /* the minimum needed to create one */ }
export interface NewPaymentData { /* what gets persisted on create */ }

export class Payment {
  public readonly id: number;
  // ... fields

  private constructor(props: PaymentProps) {
    this.id = props.id;
    // ... explicit field-by-field assignment
  }

  static create(props: PaymentCreateProps): NewPaymentData { /* ... */ }
  static reconstitute(props: PaymentProps): Payment { return new Payment(props); }
  // one static per state transition: confirm(), cancel(), ...
}
```

Rules: **private** constructor; `create` returns plain data (not an instance);
`reconstitute` is the only way to rehydrate; money amounts as `string`; dates as ISO
`string`; states as a literal union (`"A" | "I"`), **never `enum`**; no imports from
outside the domain.

## 4. Port

```ts
export interface IPaymentRepository {
  create(data: NewPaymentData): Promise<Payment>;
  findById(id: number): Promise<Payment | null>;
}
```

Reads return `| null`. No Prisma or Express types here.

## 5. Row types and repository mappers

`infrastructure/repositories/types/<m>.types.ts` hand-declares the shape the ORM
returns (`Prisma<X>Row`). The `*-to-db` and `<m>-to-domain` mappers do the translation.
`as Numeric<12, 2>` for amounts lives **only** in the `*-to-db` mapper.

## 6. Repository implementation

```ts
interface Deps { db: typeof DbInstance }

export default class PgSqlPaymentRepository implements IPaymentRepository {
  private readonly db: typeof DbInstance;

  constructor(deps: Deps) { this.db = deps.db; }

  async create(data: NewPaymentData): Promise<Payment> {
    const row = await this.db.orm.public.Payment.create(paymentCreateToDbMapper(data));
    return paymentToDomainMapper(row);
  }
}
```

If an operation spans several tables, it belongs in **one transaction** and as **a
single method** on the port — atomicity is part of the contract.

## 7-11. Use cases, schemas, HTTP mappers, DTOs, controller, and router

Identical to the `owee-endpoint` skill — follow it for every action in the module. One
`Deps` per class, one `execute` per use case, one mapper per file.

The controller groups every action in the module:

```ts
interface Deps {
  paymentCreateUseCase: PaymentCreateUseCase;
  paymentConfirmUseCase: PaymentConfirmUseCase;
}

export default class ExpressPaymentController { /* ... */ }
```

The router is a factory that **receives** the controller:

```ts
export default function createPaymentRouter(controller: ExpressPaymentController) {
  const router: Router = Router();
  // routes, each with its @openapi block
  return router;
}
```

## 12. Container

The usual three in `src/infrastructure/container/container.ts`: imports, `Cradle`
properties, `asClass(...).singleton()` registrations.

## 13. Mount on the API version

In `src/routes/v1/index.ts`:

```ts
import createPaymentRouter from "#modules/payment/infrastructure/http/payment.router.js";

router.use("/payment", createPaymentRouter(container.resolve("paymentController")));
```

## 14. Documentation

- Add the module's tag to `tags` in `src/infrastructure/docs/swagger-options.ts`.
- Create `src/infrastructure/docs/schemas/<m>.docs.ts` with its `components.schemas`.
- Document every route with the `swagger-endpoint-docs` skill.

## 15. Data model

If the module needs new tables or columns, use the `prisma-contract-change` skill
before writing the repository, so the types already exist when you need them.

## Final checklist

- [ ] Alias `#<m>/*` added to `package.json`
- [ ] Entity with a private constructor, `create`, and `reconstitute`
- [ ] Port in `domain/repositories/`, reads returning `| null`
- [ ] One use case per action, validations in order existence → state → authorization → business rule
- [ ] One mapper per file, pure functions
- [ ] Every response DTO typed
- [ ] Controller and repository follow the `Deps` pattern
- [ ] Router is a factory receiving the controller
- [ ] Container: import + `Cradle` + `register`
- [ ] Mounted in `routes/v1/index.ts`
- [ ] Tag + `components.schemas` + `@openapi` blocks on every route
- [ ] `./node_modules/.bin/tsc --noEmit` clean
- [ ] Endpoints visible at `/api/v1/docs`
