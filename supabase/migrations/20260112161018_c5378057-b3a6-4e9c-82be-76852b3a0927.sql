-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add PIN columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pin_hash TEXT,
ADD COLUMN IF NOT EXISTS pin_set_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pin_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pin_locked_until TIMESTAMPTZ;

-- Update existing user phone number (iouantchi@gmail.com -> +22375094979)
UPDATE public.profiles 
SET phone = '+22375094979', updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'iouantchi@gmail.com'
);

-- Function to verify user PIN securely
CREATE OR REPLACE FUNCTION public.verify_user_pin(
  p_phone TEXT,
  p_pin TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Verify PIN
  IF v_profile.pin_hash = crypt(p_pin, v_profile.pin_hash) THEN
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

-- Function to set/update user PIN
CREATE OR REPLACE FUNCTION public.set_user_pin(
  p_user_id UUID,
  p_pin TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate PIN format (4 digits)
  IF p_pin !~ '^\d{4}$' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Le PIN doit contenir exactement 4 chiffres');
  END IF;
  
  -- Update PIN hash
  UPDATE profiles 
  SET 
    pin_hash = crypt(p_pin, gen_salt('bf')),
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.verify_user_pin(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_pin(UUID, TEXT) TO authenticated;