
import { z } from 'zod';

// Schéma pour les données de l'administrateur SFD
export const sfdAdminSchema = z.object({
  adminName: z.string().min(2, "Le nom complet est requis").optional(),
  adminEmail: z.string().email("Email invalide").optional(),
  adminPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
});

// Define the status enum to be consistent across the application
const statusEnum = z.enum(["active", "pending", "suspended", "inactive"]);

// Schéma pour les données de base de la SFD
export const sfdFormSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  code: z.string().min(2, "Le code est requis"),
  region: z.string().optional(),
  status: statusEnum.default("active"),
  description: z.string().optional(),
  contact_email: z.string().email("Email invalide").optional(),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().optional(),
  legal_document_url: z.union([z.string(), z.null()]).optional(),
  subsidy_balance: z.number().optional(),
  
  // Admin fields for creation form only, not for editing existing SFDs
  adminName: z.string().min(2, "Le nom complet est requis").optional(),
  adminEmail: z.string().email("Email invalide").optional(),
  adminPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
});

export type SfdFormValues = z.infer<typeof sfdFormSchema>;
