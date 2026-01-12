-- Corriger la fonction set_user_pin avec extensions.crypt et extensions.gen_salt
CREATE OR REPLACE FUNCTION public.set_user_pin(p_user_id uuid, p_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate PIN format (4 digits)
  IF p_pin !~ '^\d{4}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Le PIN doit contenir exactement 4 chiffres');
  END IF;
  
  -- Update PIN hash using extensions schema
  UPDATE profiles 
  SET 
    pin_hash = extensions.crypt(p_pin, extensions.gen_salt('bf')),
    pin_set_at = NOW(),
    pin_attempts = 0,
    pin_locked_until = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Utilisateur non trouvé');
  END IF;
  
  -- Log PIN setup
  INSERT INTO audit_logs (user_id, action, category, severity, status)
  VALUES (p_user_id, 'pin_setup', 'authentication', 'info', 'success');
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Corriger la fonction verify_user_pin avec extensions.crypt
CREATE OR REPLACE FUNCTION public.verify_user_pin(p_phone text, p_pin text)
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
  SELECT id, pin_hash, pin_attempts, pin_locked_until 
  INTO v_profile
  FROM profiles
  WHERE REPLACE(phone, ' ', '') = p_phone;
  
  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Utilisateur non trouvé');
  END IF;
  
  -- Check if account is locked
  IF v_profile.pin_locked_until IS NOT NULL AND v_profile.pin_locked_until > v_now THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Compte temporairement bloqué',
      'locked_until', v_profile.pin_locked_until
    );
  END IF;
  
  -- Check if PIN is set
  IF v_profile.pin_hash IS NULL THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'PIN non configuré', 
      'needs_setup', true,
      'user_id', v_profile.id
    );
  END IF;
  
  -- Verify PIN using extensions.crypt
  IF v_profile.pin_hash = extensions.crypt(p_pin, v_profile.pin_hash) THEN
    -- Reset attempts on success
    UPDATE profiles 
    SET pin_attempts = 0, pin_locked_until = NULL, updated_at = v_now
    WHERE id = v_profile.id;
    
    -- Log successful login
    INSERT INTO audit_logs (user_id, action, category, severity, status, details)
    VALUES (v_profile.id, 'pin_login', 'authentication', 'info', 'success', 
      jsonb_build_object('phone', p_phone));
    
    RETURN jsonb_build_object('success', true, 'user_id', v_profile.id);
  ELSE
    -- Increment failed attempts
    UPDATE profiles 
    SET 
      pin_attempts = COALESCE(pin_attempts, 0) + 1,
      pin_locked_until = CASE 
        WHEN COALESCE(pin_attempts, 0) >= 4 THEN v_now + INTERVAL '15 minutes'
        ELSE NULL
      END,
      updated_at = v_now
    WHERE id = v_profile.id;
    
    -- Log failed attempt
    INSERT INTO audit_logs (user_id, action, category, severity, status, details)
    VALUES (v_profile.id, 'pin_login_failed', 'authentication', 'warn', 'failed',
      jsonb_build_object('phone', p_phone, 'attempts', v_profile.pin_attempts + 1));
    
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'PIN incorrect',
      'attempts_remaining', 5 - COALESCE(v_profile.pin_attempts, 0) - 1
    );
  END IF;
END;
$$;