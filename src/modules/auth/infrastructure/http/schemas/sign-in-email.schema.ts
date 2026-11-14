import { z } from "zod";

export const signInEmailSchema = z.object({
  user: z.object({
    email: z.email("Correo inválido").trim().toLowerCase(),
    password: z.string().min(1, "La contraseña es obligatoria"),
  }),
});

export type SignInEmailSchema = z.infer<typeof signInEmailSchema>;
