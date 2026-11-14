import { z } from "zod";

export const debtIdentitySchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type DebtIdentitySchema = z.infer<typeof debtIdentitySchema>;
