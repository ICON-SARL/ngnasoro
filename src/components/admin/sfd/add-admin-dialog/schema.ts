
import * as z from 'zod';

export const adminFormSchema = z.object({
  full_name: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
  email: z.string().email({ message: 'Adresse e-mail invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
  role: z.string().min(1, { message: 'Veuillez sélectionner un rôle' }),
  notify: z.boolean().default(true),
});

export type AdminFormValues = z.infer<typeof adminFormSchema>;
