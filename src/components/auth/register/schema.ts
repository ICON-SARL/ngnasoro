
import * as z from 'zod';
import { MALI_PHONE_REGEX, PHONE_FORMAT_MESSAGE } from '@/lib/constants';

export const registerSchema = z.object({
  fullName: z.string()
    .min(3, { message: 'Le nom complet doit contenir au moins 3 caractères' })
    .max(50, { message: 'Le nom complet ne peut pas dépasser 50 caractères' }),
  email: z.string()
    .email({ message: 'Veuillez entrer une adresse email valide' }),
  phoneNumber: z.string()
    .regex(MALI_PHONE_REGEX, { message: PHONE_FORMAT_MESSAGE })
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .regex(/[A-Z]/, { message: 'Le mot de passe doit contenir au moins une majuscule' })
    .regex(/[0-9]/, { message: 'Le mot de passe doit contenir au moins un chiffre' }),
  acceptTerms: z.boolean()
    .refine(val => val === true, { 
      message: 'Vous devez accepter les conditions d\'utilisation' 
    }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
