---
description: Audit code against Owee's architecture and type-safety rules
argument-hint: [file, module, or empty for what changed]
---

Audit with the `owee-review` skill: **$ARGUMENTS**

With no argument, review what was touched in this conversation; if nothing was, go
module by module through `src/modules/**`.

Report grouped by severity with file and line. Don't repeat findings already logged in
the most recent file under `.claude/audits/` — reference its code (F1…Fn). Write a
**new** timestamped file for this audit (don't overwrite the previous one), in English.
Never report a missing feature — only architecture/type/logic issues.
