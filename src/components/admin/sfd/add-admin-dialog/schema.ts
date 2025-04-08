
import * as z from "zod";

export const adminFormSchema = z.object({
  email: z.string().email({
    message: "Veuillez saisir une adresse email valide",
  }),
  full_name: z.string().min(2, {
    message: "Le nom complet doit comporter au moins 2 caractères",
  }),
  password: z.string().min(8, {
    message: "Le mot de passe doit comporter au moins 8 caractères",
  }),
  role: z.string().default("gérant"),
  notify: z.boolean().default(true),
});

export type AdminFormValues = z.infer<typeof adminFormSchema>;
