-- Fonction de lookup téléphone SANS effet de bord (pas de modification pin_attempts)
CREATE OR REPLACE FUNCTION public.get_pin_login_state(p_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_profile RECORD;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Normalize phone number (remove spaces)
  p_phone := REPLACE(p_phone, ' ', '');
  
  -- Find user by phone
  SELECT id, pin_hash, pin_locked_until 
  INTO v_profile
  FROM profiles
  WHERE REPLACE(phone, ' ', '') = p_phone;
  
  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object(
      'exists', false,
      'user_id', null,
      'needs_setup', false,
      'locked_until', null
    );
  END IF;
  
  -- Check if account is locked
  IF v_profile.pin_locked_until IS NOT NULL AND v_profile.pin_locked_until > v_now THEN
    RETURN jsonb_build_object(
      'exists', true,
      'user_id', v_profile.id,
      'needs_setup', false,
      'locked_until', v_profile.pin_locked_until
    );
  END IF;
  
  -- Check if PIN needs setup
  IF v_profile.pin_hash IS NULL THEN
    RETURN jsonb_build_object(
      'exists', true,
      'user_id', v_profile.id,
      'needs_setup', true,
      'locked_until', null
    );
  END IF;
  
  -- Normal state - user exists with PIN configured
  RETURN jsonb_build_object(
    'exists', true,
    'user_id', v_profile.id,
    'needs_setup', false,
    'locked_until', null
  );
END;
$$;

-- Débloquer les comptes potentiellement verrouillés par le bug du dummy PIN
UPDATE profiles 
SET pin_attempts = 0, pin_locked_until = NULL 
WHERE pin_locked_until IS NOT NULL;