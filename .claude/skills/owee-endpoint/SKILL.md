---
name: owee-endpoint
description: Adds or changes an endpoint in an existing Owee module, respecting the hexagonal architecture. Use it when asked for a new route, action, or use case on debt/auth/payments ("endpoint to list my debts", "add a reject action", "add PATCH settle"), or when the shape of a request or response changes.
---

# Adding an endpoint to an existing module

An endpoint in Owee is **not one file** — it's up to 7 pieces across 3 layers. Build
them **inside-out** (domain → application → infrastructure) so the types guide each
step instead of fighting at the end.

Before starting, read `.claude/docs/architecture.md §2-3` (dependency rules and
responsibilities). This skill does not define business rules — if the action's
behavior (who's allowed to do what, what states are valid, what the invariants are)
isn't already obvious from the existing code, ask the user instead of guessing.

## Piece checklist

For action `<entity>-<action>` in module `<m>`:

| # | Layer | File | Always? |
|---|---|---|---|
| 1 | domain | `domain/entities/<entity>.entity.ts` — static transition method + its `<X><Action>Data` interface | if it changes state |
| 2 | domain | `domain/repositories/<m>.repository.ts` — new signature on the port | if it touches the DB |
| 3 | application | `application/dto/<entity>-<action>.dto.ts` | if it receives data |
| 4 | application | `application/use-cases/<entity>-<action>.use-case.ts` | **yes** |
| 5 | infra/http | `infrastructure/http/schemas/<entity>-<action>.schema.ts` (Zod) | if it receives data |
| 6 | infra/http | `infrastructure/http/mappers/<entity>-<action>-to-domain.mapper.ts` | if there's a schema |
| 7 | infra/http | `infrastructure/http/dto/<entity>-<action>-response.dto.ts` | if it returns data |
| 8 | infra/repo | `infrastructure/repositories/mappers/<entity>-<action>-to-db.mapper.ts` | if it writes to the DB |
| 9 | infra/repo | `infrastructure/repositories/pgsql-<m>.repository.ts` — implementation | if it touches the DB |
| 10 | infra/http | `infrastructure/http/<m>.controller.ts` — method + dependency | **yes** |
| 11 | infra/http | `infrastructure/http/<m>.router.ts` — route + middlewares + **OpenAPI doc** | **yes** |
| 12 | container | `infrastructure/container/container.ts` — import + `Cradle` + `register` | **yes** |

## Order of work

### 1. Domain

If the action changes an entity's state, add a **static method** that returns only the
data to persist (it doesn't mutate the instance):

```ts
export interface DebtRejectData {
  id: number;
  isConfirmed: boolean;
  status: DebtStatus;
  updatedAt: string;
}

static reject(props: DebtIdentityProps): DebtRejectData {
  const now = new Date();
  return { id: props.id, isConfirmed: false, status: "I", updatedAt: now.toISOString() };
}
```

`new Date().toISOString()` goes **here**, not in the repository or the controller.

### 2. Port

Add the method to `I<M>Repository`. Reads that may find nothing return
`Promise<X | null>` — **the repository does not throw HTTP errors**.

### 3. Application DTO

A plain object with what the use case needs. No Zod, no Prisma types.

### 4. Use case

One class, one `execute`. It's the **only** place business rules live:

```ts
interface Deps { debtRepository: IDebtRepository }

export default class DebtRejectUseCase {
  private readonly debtRepository: IDebtRepository;

  constructor(deps: Deps) {
    this.debtRepository = deps.debtRepository;
  }

  async execute(user: User, data: DebtIdentityDTO): Promise<void> {
    const debt = await this.debtRepository.findById(data.id);
    if (!debt) throw error.notFound("...");           // existence
    if (debt.status !== "A") throw error.conflict("...");  // state
    // ...authorization and business checks the user confirms for this action...
    await this.debtRepository.reject(Debt.reject(data));
  }
}
```

Validation order is existence → state → authorization → business rule. The first
parameter is always the authenticated `User` when the action's outcome depends on who
runs it. **Confirm the actual authorization/state rules with the user before coding
them** — don't infer them from similar-looking code elsewhere in the module; a nearby
use case may itself be wrong (check `.claude/audits/findings.md`).

### 5. Zod schema

```ts
export const debtRejectSchema = z.object({
  id: z.coerce.number().int().positive(),   // params/query always arrive as string
});
export type DebtRejectSchema = z.infer<typeof debtRejectSchema>;
```

Body → nested under the resource key (`{ debt: {...} }`). Zod validates **shape**; it
doesn't own business rules.

### 6-8. Mappers

Pure functions, one file each, typed on both ends:

```ts
// http/mappers — flattens JSON into the DTO
export function debtRejectToDomainMapper(data: DebtRejectSchema): DebtIdentityDTO {
  return { id: data.id };
}

// http/dto — domain into public JSON
export interface DebtIdentityResponseDTO { id: number }
export function debtIdentityToResponseMapper(data: Debt): DebtIdentityResponseDTO {
  return { id: data.id };
}

// repositories/mappers — domain into the ORM payload
export function debtRejectToDbMapper(data: DebtRejectData) {
  return { isConfirmed: data.isConfirmed, status: data.status, updatedAt: data.updatedAt };
}
```

No business `if`, no `await`, no `any`.

### 9. Repository

```ts
async reject(data: DebtRejectData): Promise<void> {
  await this.db.orm.public.Debt.where({ id: data.id }).update(debtRejectToDbMapper(data));
}
```

### 10. Controller

```ts
rejectDebt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await this.debtRejectUseCase.execute(
      res.locals.user,
      debtRejectToDomainMapper(req.params),   // ← the SAME part the router validates
    );
    res.success(null, 204);
  } catch (error) {
    next(error);
  }
};
```

Class property with an arrow function (so `this` survives being passed to the router).
`res.success(...)`, never `res.json(...)`.

### 11. Router

```ts
router.patch(
  "/:id/reject",
  authenticate,                                 // before validation
  validation({ params: debtRejectSchema }),
  controller.rejectDebt,
);
```

Document the route with the `swagger-endpoint-docs` skill — not optional.

### 12. Container

The usual three: import, `Cradle` property, `asClass(X).singleton()`.

## Verification

```bash
./node_modules/.bin/tsc --noEmit
pnpm dev     # and test it at http://localhost:3000/api/v1/docs
```

Minimum manual check: happy path, invalid request (400), no cookie (401), another
user's resource (403), nonexistent id (404).

## Mistakes to avoid

- Mapping inline in the controller instead of creating the mapper file.
- Validating `params` in the router and reading `req.body` in the controller.
- `z.number()` for a path id — it always fails; use `z.coerce.number()`.
- Re-validating with Zod a second time in the controller because the router's
  validation didn't coerce the value you needed (see the `validation.ts` entry in
  `.claude/audits/findings.md` before copying that pattern).
- Putting the authorization rule in the router or the repository.
- Returning the raw entity instead of a response DTO.
- Forgetting the `Cradle` property (the `resolve` call stops typechecking).
- Using `number` for money amounts.
