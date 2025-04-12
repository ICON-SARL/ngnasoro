
import { z } from 'zod';

export const addAdminSchema = z.object({
  full_name: z.string().min(1, { message: 'Nom complet requis' }),
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
  role: z.string().default('sfd_admin'),
  notify: z.boolean().default(true),
});

export type AddAdminFormValues = z.infer<typeof addAdminSchema>;
