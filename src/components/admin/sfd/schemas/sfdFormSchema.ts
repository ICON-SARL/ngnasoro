
import * as z from 'zod';

export const sfdFormSchema = z.object({
  name: z.string().min(3, {
    message: 'Le nom doit contenir au moins 3 caractères',
  }),
  code: z.string().min(2, {
    message: 'Le code doit contenir au moins 2 caractères',
  }),
  region: z.string().min(2, {
    message: 'La région doit être spécifiée',
  }),
  phone: z.string().optional(),
  status: z.enum(['active', 'pending', 'suspended']),
  logo_url: z.string().optional(),
  legal_document_url: z.string().optional(),
  subsidy_balance: z.number().optional(),
});

export type SfdFormValues = z.infer<typeof sfdFormSchema>;
