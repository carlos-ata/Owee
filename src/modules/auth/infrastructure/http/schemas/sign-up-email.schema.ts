import { z } from "zod";

export const signUpEmailSchema = z.object({
  user: z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
    lastNames: z
      .string()
      .trim()
      .min(1, "Los apellidos son obligatorios")
      .max(100),
    email: z.email("Correo inválido").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128, "Máximo 128 caracteres"),
  }),
});

export type SignUpEmailSchema = z.infer<typeof signUpEmailSchema>;
