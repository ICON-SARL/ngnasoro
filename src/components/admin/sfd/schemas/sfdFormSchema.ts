
import { z } from 'zod';

export const sfdFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  code: z.string().min(1, { message: 'Le code est requis' }),
  region: z.string().optional(),
  status: z.enum(['active', 'pending', 'suspended']).default('active'),
  logo_url: z.string().optional().nullable(),
  contact_email: z.string().email({ message: 'Email invalide' }).optional().nullable(),
  phone: z.string().optional().nullable(),
  legal_document_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  subsidy_balance: z.number().optional(),
});

export type SfdFormValues = z.infer<typeof sfdFormSchema>;
