---
name: swagger-endpoint-docs
description: Documents Owee endpoints with swagger-jsdoc. Use it when creating or changing a route in a *.router.ts, when a Zod schema or a response DTO changes, or when asked to "document the API", "update Swagger", "it's missing from the docs", or "generate the OpenAPI spec".
---

# Documenting endpoints with Swagger (swagger-jsdoc)

In Owee, the OpenAPI spec **is written as JSDoc on the route, inside `*.router.ts`**.
There is no hand-written spec file and no Zod-to-OpenAPI generation: the router is the
single source of truth.

## How the pipeline works

```
src/modules/**/infrastructure/http/*.router.ts   ← @openapi blocks (paths)
src/infrastructure/docs/schemas/*.docs.ts         ← @openapi blocks (components.schemas)
            │
            ▼  swagger-jsdoc, per the `apis` glob in
               src/infrastructure/docs/swagger-options.ts
            ▼
     app.ts  →  GET /api/v1/docs   (swagger-ui-express)
```

Pipeline rules:

- The glob points at **`.ts` under `./src`**, not `dist`: `tsc` strips comments on
  compile, so the spec must always be generated from source, in every environment.
- `swagger-options.ts` already defines `servers`, `securitySchemes.cookieAuth`, the
  `ApiSuccess` / `ApiError` / `ValidationError` schemas, and reusable `responses`
  (`ValidationFailed`, `Unauthorized`, `Forbidden`, `NotFound`, `Conflict`, `BadRequest`).
  **Reuse them with `$ref`; don't repeat those bodies on every endpoint.**
- A module's tag is declared in `tags` in `swagger-options.ts`. If you're documenting a
  new module, add its tag there first.

## Procedure

1. **Read the route** in the `*.router.ts`: method, path, middlewares (`authenticate`
   present ⇒ it needs `security`), and which Zod schema validates `body`, `params`, or
   `query`.
2. **Read the Zod schema** to pull fields, requiredness, lengths, regexes, and
   messages. The doc must **match the Zod**, not what you assume it validates.
3. **Read the response DTO** (`infrastructure/http/dto/*-response.dto.ts`) for the exact
   shape of `data`. Remember the envelope: `{ statusCode, data, error }`.
4. **Read the use case** to enumerate the real business errors it throws
   (`error.notFound`, `error.badRequest`, …) and map them to HTTP codes. Don't invent
   responses the code can't produce, and don't skip the ones it can.
5. **Decide where each schema goes**:
   - used by a single endpoint and trivial → inline in the route's block;
   - represents a reusable entity or request/response → `components.schemas` in
     `src/infrastructure/docs/schemas/<module>.docs.ts`, referenced via `$ref`.
6. **Write the block** right above the `router.<method>(...)` call, following the
   templates below.
7. **Verify**: `pnpm dev` and open `http://localhost:3000/api/v1/docs`. The endpoint
   must appear, the lock icon must show if it carries `authenticate`, and "Try it out"
   must work. If it doesn't appear, check the YAML indentation (see common errors).
8. `./node_modules/.bin/tsc --noEmit` to confirm nothing broke.

## Template — authenticated endpoint with a body

```ts
/**
 * @openapi
 * /debt:
 *   post:
 *     tags: [Debt]
 *     summary: Register a debt
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DebtCreateRequest'
 *     responses:
 *       201:
 *         description: Debt registered
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     statusCode: { type: integer, example: 201 }
 *                     data:
 *                       $ref: '#/components/schemas/DebtIdentityResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: The debtor or the creditor user does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post("/", authenticate, validation({ body: debtCreateSchema }), controller.createDebt);
```

## Template — endpoint with a path param

```ts
/**
 * @openapi
 * /debt/{id}/confirm:
 *   patch:
 *     tags: [Debt]
 *     summary: Confirm a debt
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Debt confirmed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DebtIdentityResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
```

## Template — 204 with no body

```ts
 *     responses:
 *       204:
 *         description: Debt cancelled (soft delete, `status = "I"`)
```

## Template — paginated list

```ts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: cursor
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Page of results
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Debt' }
 *                         nextCursor: { type: integer, nullable: true }
```

## Template — endpoint that issues the session cookie

```ts
 *     responses:
 *       200:
 *         description: Session started
 *         headers:
 *           Set-Cookie:
 *             schema: { type: string }
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/PublicUser' }
```

## Template — new `components.schemas`

In `src/infrastructure/docs/schemas/<module>.docs.ts`:

```ts
/**
 * @openapi
 * components:
 *   schemas:
 *     PaymentCreateRequest:
 *       type: object
 *       required: [payment]
 *       properties:
 *         payment:
 *           type: object
 *           # ... mirrors the Zod in infrastructure/http/schemas/
 */
export {};
```

The trailing `export {}` is required: the file must be a valid ESM module.

## Checklist per documented endpoint

- [ ] `tags` exists in `swagger-options.ts`
- [ ] `summary`, one line, imperative
- [ ] `security: [{ cookieAuth: [] }]` if and only if the route carries `authenticate`
- [ ] The block's path is **relative to `/api/v1`** (`/debt/{id}`, not `/api/v1/debt/{id}`)
- [ ] Every `{param}` in the path is declared in `parameters`
- [ ] The request body matches the Zod field-for-field (including `minLength`,
      `maxLength`, `pattern`, `nullable`)
- [ ] The success response uses the `ApiSuccess` envelope + the real DTO's `data`
- [ ] Only the errors the use case can actually throw are listed, via `$ref` to
      `components/responses`
- [ ] `400` present if the route has `validation(...)`
- [ ] `401` present if it has `authenticate`
- [ ] Non-obvious fields carry an `example` (amounts as `"150.50"`, ids)
- [ ] Visible and working at `/api/v1/docs`

## Common errors

| Symptom | Cause |
|---|---|
| Endpoint doesn't show up | the file doesn't match the `apis` glob (must be `infrastructure/http/*.router.ts`), or the block is missing `@openapi` |
| Shows up empty or broken | YAML indentation: each level is **2 spaces** after ` * `; never mix tabs |
| `$ref` doesn't resolve | the name doesn't exist under `components`, or the leading `#/` is missing |
| No lock icon | missing `security`, or `securitySchemes` isn't named `cookieAuth` |
| "Try it out" doesn't send the cookie | expected cross-origin behavior in Swagger UI; test from the same origin or with `curl --cookie` |
| A regex `pattern` breaks | quote it in YAML: `pattern: '^\d+$'` |
| Spec is empty in production | `apis` points at `dist`; it must point at `./src/**/*.ts` |

## What not to do

- Don't describe endpoints that don't exist in the router.
- Don't document internal fields the response DTO doesn't expose (`password`,
  `creatorId` if it's not returned, DB columns).
- Don't duplicate `ApiError` on every response: use `components/responses`.
- Don't swap Zod-to-OpenAPI generation in with a new library without asking first (see
  rule 15 in `.claude/CLAUDE.md`).
