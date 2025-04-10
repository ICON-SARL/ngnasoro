
import * as z from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(3, "Le nom complet doit contenir au moins 3 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
