-- Phase 7: Renforcer la sécurité des mots de passe
-- Note: Ces paramètres de sécurité sont configurés au niveau de l'authentification Supabase
-- et ne nécessitent pas de modifications de schéma de base de données.
-- Cependant, nous créons cette migration pour documenter les exigences de sécurité.

-- Créer une fonction de validation de mot de passe si elle n'existe pas
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier la longueur minimale
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier la présence d'une majuscule
  IF password !~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier la présence d'une minuscule
  IF password !~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Vérifier la présence d'un chiffre
  IF password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Commentaire pour documenter les exigences de sécurité
COMMENT ON FUNCTION public.validate_password_strength IS 
'Valide la force du mot de passe : minimum 8 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre';

-- Mettre à jour audit_logs pour tracer les tentatives de changement de mot de passe
INSERT INTO public.audit_logs (
  user_id,
  action,
  category,
  severity,
  status,
  details
) VALUES (
  NULL,
  'password_policy_update',
  'security',
  'info',
  'success',
  jsonb_build_object(
    'min_length', 8,
    'require_uppercase', true,
    'require_lowercase', true,
    'require_numbers', true,
    'updated_at', NOW()
  )
);