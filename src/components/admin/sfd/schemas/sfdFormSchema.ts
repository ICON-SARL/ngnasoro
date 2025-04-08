
import { z } from 'zod';

export const sfdFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  code: z.string().min(1, { message: 'Le code est requis' }),
  region: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email({ message: 'Email invalide' }).optional().or(z.literal('')),
  contact_email: z.string().email({ message: 'Email invalide' }).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo_file: z.any().optional(),
  legal_document_file: z.any().optional(),
  // Add the missing properties
  status: z.enum(['active', 'pending', 'suspended']).optional().default('active'),
  logo_url: z.string().optional(),
  legal_document_url: z.string().optional(),
  subsidy_balance: z.number().optional(),
});

export type SfdFormValues = z.infer<typeof sfdFormSchema>;
