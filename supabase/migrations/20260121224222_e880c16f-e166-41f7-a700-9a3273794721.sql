-- Première migration : Ajouter seulement les nouveaux rôles à l'enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cashier';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supervisor';