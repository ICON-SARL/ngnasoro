-- Corriger les fonctions sans search_path sécurisé
-- Ces fonctions sont déjà définies mais manquent le SET search_path

-- 1. Corriger update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Corriger update_subsidy_used_amount
CREATE OR REPLACE FUNCTION public.update_subsidy_used_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sfd_subsidies 
    SET used_amount = COALESCE(used_amount, 0) + NEW.amount
    WHERE id = NEW.subsidy_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sfd_subsidies 
    SET used_amount = COALESCE(used_amount, 0) - OLD.amount
    WHERE id = OLD.subsidy_id;
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Corriger generate_client_code
CREATE OR REPLACE FUNCTION public.generate_client_code(sfd_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  counter INTEGER := 1;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := sfd_code || '-' || LPAD(counter::TEXT, 6, '0');
    
    SELECT EXISTS(
      SELECT 1 FROM sfd_clients WHERE client_code = new_code
      UNION
      SELECT 1 FROM profiles WHERE client_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
    counter := counter + 1;
  END LOOP;
  
  RETURN new_code;
END;
$$;