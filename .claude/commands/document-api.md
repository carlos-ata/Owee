---
description: Document or update endpoints in Swagger
argument-hint: [module or route] — empty = review all of them
---

Document with the `swagger-endpoint-docs` skill: **$ARGUMENTS**

With no argument: walk every `src/modules/**/infrastructure/http/*.router.ts`, find
routes with no `@openapi` block or whose doc no longer matches its Zod schema / response
DTO, and fix them.

Finish by verifying the spec generates without losing any paths, and report how many
endpoints ended up documented.
