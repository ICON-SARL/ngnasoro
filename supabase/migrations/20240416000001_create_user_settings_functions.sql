
-- Function to get user settings by user ID
CREATE OR REPLACE FUNCTION public.get_user_settings(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings JSON;
BEGIN
  SELECT 
    jsonb_build_object(
      'notifications', us.notifications,
      'language', us.language
    )
  INTO v_settings
  FROM public.user_settings us
  WHERE us.user_id = p_user_id;

  -- Return default settings if not found
  IF v_settings IS NULL THEN
    RETURN jsonb_build_object(
      'notifications', jsonb_build_object(
        'push', true,
        'email', false,
        'sms', true,
        'sound', true
      ),
      'language', 'fr'
    );
  END IF;

  RETURN v_settings;
END;
$$;

-- Function to get security settings by user ID
CREATE OR REPLACE FUNCTION public.get_security_settings(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings JSON;
BEGIN
  SELECT 
    jsonb_build_object(
      'two_factor_auth', ss.two_factor_auth,
      'biometric_auth', ss.biometric_auth,
      'sms_auth', ss.sms_auth
    )
  INTO v_settings
  FROM public.security_settings ss
  WHERE ss.user_id = p_user_id;

  -- Return default settings if not found
  IF v_settings IS NULL THEN
    RETURN jsonb_build_object(
      'two_factor_auth', false,
      'biometric_auth', false,
      'sms_auth', true
    );
  END IF;

  RETURN v_settings;
END;
$$;

-- Function to upsert user settings
CREATE OR REPLACE FUNCTION public.upsert_user_settings(
  p_user_id UUID,
  p_notifications JSONB,
  p_language TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO public.user_settings (
    user_id,
    notifications,
    language,
    updated_at
  )
  VALUES (
    p_user_id,
    p_notifications,
    p_language,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    notifications = p_notifications,
    language = p_language,
    updated_at = now()
  RETURNING jsonb_build_object(
    'user_id', user_id,
    'notifications', notifications,
    'language', language,
    'updated_at', updated_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- Function to upsert security settings
CREATE OR REPLACE FUNCTION public.upsert_security_settings(
  p_user_id UUID,
  p_two_factor_auth BOOLEAN,
  p_biometric_auth BOOLEAN,
  p_sms_auth BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO public.security_settings (
    user_id,
    two_factor_auth,
    biometric_auth,
    sms_auth,
    updated_at
  )
  VALUES (
    p_user_id,
    p_two_factor_auth,
    p_biometric_auth,
    p_sms_auth,
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    two_factor_auth = p_two_factor_auth,
    biometric_auth = p_biometric_auth,
    sms_auth = p_sms_auth,
    updated_at = now()
  RETURNING jsonb_build_object(
    'user_id', user_id,
    'two_factor_auth', two_factor_auth,
    'biometric_auth', biometric_auth,
    'sms_auth', sms_auth,
    'updated_at', updated_at
  ) INTO v_result;

  RETURN v_result;
END;
$$;
