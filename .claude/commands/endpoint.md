---
description: Add an endpoint to an existing module, following Owee's architecture
argument-hint: <module> <action> — e.g. "debt reject" or "debt list my debts"
---

Implement the requested endpoint: **$ARGUMENTS**

Use the `owee-endpoint` skill, and document it with `swagger-endpoint-docs`.

Before writing code:
1. Read the target module fully to copy its patterns.
2. If the behavior (authorization, valid states, what counts as a duplicate, etc.)
   isn't already obvious from existing code, ask the user instead of guessing — don't
   invent business rules.
3. If the change needs new columns, use `prisma-contract-change` first.

When done, run `./node_modules/.bin/tsc --noEmit` and report which files you created,
which business rules you were given to apply, and what's left out of scope.
