import { z } from "zod";

export const helloWorldSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),

  age: z
    .number()
    .int("La edad debe ser un entero")
    .min(18, "Debes ser mayor de edad")
    .optional(),
});
