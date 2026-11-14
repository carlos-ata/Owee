import { z } from "zod";

export const debtCreateSchema = z.object({
  debt: z.object({
    debtorId: z.string().min(1),
    creditorId: z.string().min(1).nullish(),
    description: z
      .string()
      .trim()
      .min(1, "La descripción es obligatoria")
      .max(255, "Máximo 255 caracteres"),
    amount: z
      .string()
      .regex(/^\d{1,10}(\.\d{1,2})?$/, "Monto inválido, máximo 2 decimales")
      .refine((value) => Number(value) > 0, "El monto debe ser mayor a 0"),
  }),
});

export type DebtCreateSchema = z.infer<typeof debtCreateSchema>;
