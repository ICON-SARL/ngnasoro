-- Phase 1: Corriger le compte existant (user_id: 1f9ef5e2-7ff7-44f5-a757-afc19097b3ac)
-- Supprimer les anciennes entrées si elles existent pour éviter les doublons
DELETE FROM public.user_roles WHERE user_id = '1f9ef5e2-7ff7-44f5-a757-afc19097b3ac';
DELETE FROM public.profiles WHERE id = '1f9ef5e2-7ff7-44f5-a757-afc19097b3ac';

-- Insérer le rôle client pour l'utilisateur existant
INSERT INTO public.user_roles (user_id, role)
VALUES ('1f9ef5e2-7ff7-44f5-a757-afc19097b3ac', 'client');

-- Créer le profil pour l'utilisateur existant
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
VALUES (
  '1f9ef5e2-7ff7-44f5-a757-afc19097b3ac',
  'Ivan Ouantchi',
  now(),
  now()
);

-- Phase 2: Créer le système automatique pour les nouveaux utilisateurs
-- Fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Créer le profil utilisateur
  INSERT INTO public.profiles (id, full_name, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
    now(),
    now()
  );
  
  -- Assigner le rôle par défaut 'user' (pas 'client' - ils doivent d'abord demander l'adhésion)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Logger dans audit_logs
  INSERT INTO public.audit_logs (
    user_id,
    action,
    category,
    severity,
    status,
    details
  )
  VALUES (
    NEW.id,
    'user_signup',
    'authentication',
    'info',
    'success',
    jsonb_build_object(
      'email', NEW.email,
      'created_at', NEW.created_at
    )
  );
  
  RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Vérifier que la fonction has_role existe et est correcte
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;