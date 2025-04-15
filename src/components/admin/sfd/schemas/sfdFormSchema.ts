
import * as z from "zod";

export const sfdFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  code: z.string().min(2, "Le code doit contenir au moins 2 caractères"),
  region: z.string().optional(),
  contact_email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  description: z.string().optional(),
  logo_url: z.string().optional(),
  legal_document_url: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended", "pending"]).optional()
});

export type SfdFormValues = z.infer<typeof sfdFormSchema>;
