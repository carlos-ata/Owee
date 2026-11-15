import { z } from "zod";
import { DebtType } from "#debt/domain/entities/debt.entity.js";

export const debtCreateSchema = z.object({
  debt: z
    .object({
      partyId: z.string().min(1).optional(),
      type: z.enum(DebtType),
      description: z
        .string()
        .trim()
        .min(1, "La descripción es obligatoria")
        .max(255, "Máximo 255 caracteres"),
      amount: z
        .string()
        .regex(/^\d{1,10}(\.\d{1,2})?$/, "Monto inválido, máximo 2 decimales")
        .refine((value) => Number(value) > 0, "El monto debe ser mayor a 0"),
    })
    .superRefine((data, ctx) => {
      if (data.type === DebtType.RECEIVABLE && !data.partyId) {
        ctx.addIssue({
          code: "custom",
          path: ["partyId"],
          message: "Party is required",
        });
      }
    }),
});

export type DebtCreateSchema = z.infer<typeof debtCreateSchema>;
