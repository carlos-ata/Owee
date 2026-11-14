# Audit findings — Owee

Technical inconsistencies, critical bugs, and nonsensical validations found in the
code. **No product/domain content here**, and no dead-code/unmounted-module findings
(those are tracked by the user separately) — only live, reachable code.

`./node_modules/.bin/tsc --noEmit` is currently clean (0 errors).

Severity: 🔴 critical bug · 🟠 risk · 🟡 inconsistency

---

## F1 🔴 Self-check makes `DebtConfirmUseCase` a no-op safeguard
[debt-confirm.use-case.ts:25](../../src/modules/debt/application/use-cases/debt-confirm.use-case.ts#L25)

```ts
if (resDebtExists.creatorId !== user.id) {
  throw error.forbidden(...);
}
```

The confirming user is compared against `creatorId` — the same user who just created
the debt in `DebtCreateUseCase`. Since the creator always satisfies this check, the
guard can never reject the person who registered the debt: the "confirm" action cannot
meaningfully fail for its own author, whatever actor is actually supposed to confirm.

## F2 🟠 Router and controller both validate `params`, independently
[debt.controller.ts:45,59](../../src/modules/debt/infrastructure/http/debt.controller.ts#L45)
calls `debtIdentitySchema.parse(req.params)` directly, even though
[debt.router.ts](../../src/modules/debt/infrastructure/http/debt.router.ts) already runs
`validation({ params: debtIdentitySchema })` on the same route.

Root cause: [validation.ts:21-37](../../src/infrastructure/middleware/validation.ts#L21)
calls `zodSchema.safeParse(req[payloadKey])` but never writes the parsed/coerced result
back onto `req[payloadKey]`, so `req.params.id` stays a raw `string` after the
middleware runs and `z.coerce.number()` never reaches the controller — the controller
re-parses to get the coerced value it needs. The schema runs twice per request, and a
controller ends up doing validation, which the architecture reserves for the router.

(A fix for this — making `validation.ts` write back `req[payloadKey] = result.data` —
was tried and reverted: on Express 5, `req.query` is a getter-only accessor with no
setter, so writing it back needs `Object.defineProperty`, not plain assignment, and
making the controller read the result back out typed requires either a type assertion
at the controller or a second parse there. Revisit this with the user before touching it
again.)

## F3 🟠 `validation()` middleware only validates its first key
[validation.ts:11](../../src/infrastructure/middleware/validation.ts#L11)

```ts
const [[payloadKey, zodSchema]] = Object.entries(validationSchema);
```

Passing `{ params, body }` in one call silently validates only `params` — whichever key
`Object.entries` returns first. A route needing both must chain two separate
`validation(...)` calls; nothing currently warns that a second key was ignored.

## F4 🟠 Debt existence checks in use cases are unreachable dead code, and the client sees an English, infrastructure-authored error
[pgsql-debt.repository.ts:39-45](../../src/modules/debt/infrastructure/repositories/pgsql-debt.repository.ts#L39):

```ts
async findById(id: number): Promise<Debt> {
  const debt = await this.db.orm.public.Debt.where({ id }).first();
  if (!debt) {
    throw error.notFound("Debt not found");
  }
  return debtToDomainMapper(debt);
}
```

The port ([debt.repository.ts:10](../../src/modules/debt/domain/repositories/debt.repository.ts#L10))
now matches this signature (`Promise<Debt>`, no `| null`), so the type-level
contradiction from the previous audit is gone — but every caller still carries the old
guard:

```ts
const resDebtExists = await this.debtRepository.findById(data.id);
if (!resDebtExists) {
  throw error.notFound("La deuda no existe");   // debt-confirm.use-case.ts:22
}
```

([debt-confirm.use-case.ts:21-24](../../src/modules/debt/application/use-cases/debt-confirm.use-case.ts#L21),
same pattern in
[debt-cancel.use-case.ts:21-24](../../src/modules/debt/application/use-cases/debt-cancel.use-case.ts#L21)).

Since `findById` now throws before ever returning a falsy value, `if (!resDebtExists)`
can never be true — both branches are unreachable in every execution path. Practically:
when a debt doesn't exist, the client receives `"Debt not found"` (English, thrown from
infrastructure) instead of the use case's intended `"La deuda no existe"` /
`"Deuda no encontrada"` (Spanish, thrown from the layer that's supposed to own that
decision per the architecture rules).

## F5 🟠 Repository reads ignore `status`
[pgsql-debt.repository.ts:39-45](../../src/modules/debt/infrastructure/repositories/pgsql-debt.repository.ts#L39)

`findById` queries `{ id }` only. `DebtCancelUseCase` sets `status: "I"` on cancel, but
nothing filters reads by `status`, so a cancelled debt is indistinguishable from an
active one to every caller of `findById` — it can still be "confirmed" after being
cancelled.

## F6 🟠 `config.isProduction` can never be `true`
[config.ts:10](../../src/config/config.ts#L10)

```ts
isProduction: process.env.NODE_ENV === "true",
```

`NODE_ENV` is set to `"production"` by convention, never the literal string `"true"`.
This flag drives [error.ts:11-16](../../src/infrastructure/middleware/error.ts#L11)
(whether the stack trace is included in error responses) — as written, stack traces
always ship, in every environment.

## F7 🟠 CORS has no origin/credentials configuration
[app.ts:24](../../src/app.ts#L24): `app.use(cors())` with no options. Better Auth's
session relies on a cookie; browsers won't attach a cookie to a cross-origin request
unless the response carries `Access-Control-Allow-Credentials: true`, which bare
`cors()` never sends. Any frontend on a different origin than the API cannot maintain a
session as currently configured.

## F8 🟡 `res.locals.user` is untyped
No `declare global { namespace Express { interface Locals { user: User } } }` exists
anywhere (the same pattern `response.ts` already uses for `res.success`). Every read of
`res.locals.user` across controllers and use cases is implicitly `any`.

## F9 🟡 `SignInEmailResponseDTO` doesn't match what its mapper returns
[sign-in-email-response.dto.ts](../../src/modules/auth/infrastructure/http/dto/sign-in-email-response.dto.ts):

```ts
export interface SignInEmailResponseDTO {
  name: string;
  lastNames: string;
  email: string;
}

export function signInEmailToResponseMapper(data: User) {
  return { user: { name: data.name, email: data.email, lastNames: data.lastNames } };
}
```

The interface is flat; the mapper returns `{ user: {...} }` and isn't annotated with
the interface at all. (The sign-up twin of this had its stale interface removed —
sign-in's was not.)

## F10 🟠 `pnpm build` cannot produce a runnable build
`tsconfig.json` sets `noEmit: true`; the `build` script is plain `tsc` (emits nothing
under `noEmit`), yet `start` runs `node dist/server.js`. There is currently no script
path that produces `dist/`.

## F11 🟡 `.env` path is resolved from `process.cwd()`
[config.ts:4-6](../../src/config/config.ts#L4): `dotenv.config({ path:
path.resolve(process.cwd(), "src/config/.env") })`. Starting the process from any
directory other than the repo root breaks env loading silently (`process.env.X` is
`undefined`, not an error).

---

## Resolved since the last audit

- `signOutUseCase` is now declared in `Cradle` (was registered but missing from the
  interface).
- `SignUpEmailResponseDTO`'s stale, mismatched interface was removed instead of fixed —
  which resolves the contradiction, though per `conventions.md §9` a response DTO is
  still expected to declare and return a typed interface. Low priority; `SignInEmailResponseDTO` (F9) still has the original mismatch.

## Suggested order

1. F1 — the confirm safeguard that can't fail for its own author.
2. F4, F5 — the read path has two compounding issues on the same flow.
3. F6, F7, F8, F9 — low-effort, high-value correctness fixes.
4. F2, F3, F10, F11 — needs a decision from the user before changing (F2 was already
   attempted and reverted); the rest are cleanup, no runtime risk.
