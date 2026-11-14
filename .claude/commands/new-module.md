---
description: Create a new hexagonal module under src/modules
argument-hint: <module name> [actions]
---

Create the module: **$ARGUMENTS**

Use the `owee-module` skill, and `owee-endpoint` for each action.

Before writing code, summarize in 5 lines: the entity and its fields, the actions, the
resulting endpoints, and whether `contract.prisma` needs changes. If the entity's
fields or states aren't already clear from the request, ask instead of guessing.

Don't forget: alias in `package.json`, container registration, mounting in
`routes/v1/index.ts`, tag + `components.schemas` in the docs, and a clean
`tsc --noEmit`.
