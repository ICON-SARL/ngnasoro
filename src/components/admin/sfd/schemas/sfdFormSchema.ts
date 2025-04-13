
import * as z from 'zod';

// Schéma de validation pour le formulaire SFD
export const sfdFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  code: z.string().min(2, {
    message: "Le code doit contenir au moins 2 caractères",
  }),
  region: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'pending', 'suspended']).default('active'),
  contact_email: z.string().email({ message: "Email invalide" }).optional().or(z.literal('')),
  email: z.string().email({ message: "Email invalide" }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  subsidy_balance: z.number().nonnegative().default(0),
  logo_url: z.string().optional().nullable(),
  legal_document_url: z.string().optional().nullable(),
});

// Type pour les valeurs du formulaire SFD
export type SfdFormValues = z.infer<typeof sfdFormSchema>;
