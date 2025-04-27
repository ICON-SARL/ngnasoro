
-- Create a function to look up users by client code with more robust joining
CREATE OR REPLACE FUNCTION public.lookup_user_by_client_code(p_client_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_record profiles%ROWTYPE;
  v_result json;
BEGIN
  -- First try to find the client code in profiles
  SELECT * INTO v_profile_record
  FROM profiles
  WHERE client_code = p_client_code;
  
  IF v_profile_record.id IS NOT NULL THEN
    -- Found in profiles table
    RETURN row_to_json(v_profile_record);
  END IF;
  
  -- Check in sfd_clients if not found in profiles
  SELECT 
    json_build_object(
      'id', sc.user_id,
      'full_name', COALESCE(p.full_name, sc.full_name),
      'email', COALESCE(p.email, sc.email),
      'phone', COALESCE(p.phone, sc.phone),
      'client_code', p_client_code,
      'sfd_id', sc.sfd_id,
      'client_id', sc.id
    ) INTO v_result
  FROM sfd_clients sc
  LEFT JOIN profiles p ON p.id = sc.user_id
  WHERE sc.client_code = p_client_code
  LIMIT 1;
  
  RETURN v_result;
END;
$$;

-- Function to get client by client code, respecting SFD boundaries 
CREATE OR REPLACE FUNCTION public.get_sfd_client_by_code(p_client_code text, p_sfd_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_record json;
BEGIN
  -- Try to find the client in the specified SFD
  SELECT 
    json_build_object(
      'id', sc.id,
      'full_name', sc.full_name,
      'email', sc.email,
      'phone', sc.phone,
      'address', sc.address,
      'sfd_id', sc.sfd_id,
      'status', sc.status,
      'user_id', sc.user_id,
      'client_code', sc.client_code,
      'profile', 
        CASE WHEN p.id IS NOT NULL THEN
          json_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'email', p.email,
            'phone', p.phone,
            'client_code', p.client_code
          )
        ELSE
          NULL
        END
    ) INTO v_client_record
  FROM sfd_clients sc
  LEFT JOIN profiles p ON p.id = sc.user_id
  WHERE 
    sc.client_code = p_client_code 
    AND (p_sfd_id IS NULL OR sc.sfd_id = p_sfd_id)
  LIMIT 1;
  
  IF v_client_record IS NOT NULL THEN
    RETURN v_client_record;
  END IF;
  
  -- If client not found directly, look for the user and see if they're associated with another SFD
  SELECT 
    json_build_object(
      'id', p.id,
      'full_name', p.full_name,
      'email', p.email,
      'phone', p.phone,
      'client_code', p.client_code,
      'has_sfd_client', (SELECT count(*) > 0 FROM sfd_clients WHERE user_id = p.id),
      'other_sfd', (
        SELECT json_build_object(
          'id', sc.id,
          'sfd_id', sc.sfd_id,
          'status', sc.status
        )
        FROM sfd_clients sc
        WHERE sc.user_id = p.id
        LIMIT 1
      )
    ) INTO v_client_record
  FROM profiles p
  WHERE p.client_code = p_client_code
  LIMIT 1;
  
  RETURN v_client_record;
END;
$$;
