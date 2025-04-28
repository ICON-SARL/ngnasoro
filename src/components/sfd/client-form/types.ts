
import { z } from 'zod';

export const clientFormSchema = z.object({
  full_name: z.string().min(2, 'Le nom complet est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  id_type: z.string().optional(),
  id_number: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
