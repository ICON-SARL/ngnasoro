
import { z } from 'zod';

const formSchema = z.object({
  full_name: z.string().min(1, "Le nom complet est requis"),
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  sfd_id: z.string().uuid("Veuillez sélectionner une SFD"),
  notify: z.boolean().default(true),
});

export type SfdAdminFormData = z.infer<typeof formSchema>;

export interface SfdAdminCreationResponse {
  success: boolean;
  error?: string;
}
