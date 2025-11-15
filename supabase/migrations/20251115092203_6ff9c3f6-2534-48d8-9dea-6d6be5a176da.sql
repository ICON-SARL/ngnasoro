-- Corriger les fonctions PostgreSQL pour ajouter SET search_path = public
-- Ceci corrige les avertissements de sécurité "function_search_path_mutable"

-- 1. Corriger la fonction update_tontine_members_count
CREATE OR REPLACE FUNCTION public.update_tontine_members_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE tontines
  SET current_members = (
    SELECT COUNT(*) FROM tontine_members
    WHERE tontine_id = COALESCE(NEW.tontine_id, OLD.tontine_id)
    AND status = 'active'
  )
  WHERE id = COALESCE(NEW.tontine_id, OLD.tontine_id);
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2. Corriger la fonction update_member_contributions
CREATE OR REPLACE FUNCTION public.update_member_contributions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE tontine_members
  SET total_contributed = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM tontine_contributions
    WHERE member_id = NEW.member_id
    AND status = 'completed'
  )
  WHERE id = NEW.member_id;
  
  UPDATE tontines
  SET total_collected = (
    SELECT COALESCE(SUM(amount), 0)
    FROM tontine_contributions
    WHERE tontine_id = NEW.tontine_id
    AND status = 'completed'
  )
  WHERE id = NEW.tontine_id;
  
  RETURN NEW;
END;
$function$;

-- 3. Corriger la fonction expire_qr_on_session_close
CREATE OR REPLACE FUNCTION public.expire_qr_on_session_close()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'closed' AND OLD.status = 'open' THEN
    UPDATE cashier_qr_codes
    SET status = 'expired'
    WHERE cash_session_id = NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$function$;