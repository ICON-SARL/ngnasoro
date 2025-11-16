-- Migration Phase 3 : Système complet d'adhésion client
-- Ajouter colonne account_type à la table accounts pour supporter 3 types de comptes par client

-- 1. Ajouter la colonne account_type à accounts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE accounts 
    ADD COLUMN account_type text CHECK (account_type IN ('operation', 'epargne', 'remboursement'));
    
    -- Mettre à jour les comptes existants avec un type par défaut
    UPDATE accounts SET account_type = 'operation' WHERE account_type IS NULL;
  END IF;
END $$;

-- 2. Créer la fonction pour approuver une demande d'adhésion
CREATE OR REPLACE FUNCTION approve_client_adhesion(
  p_request_id uuid,
  p_reviewed_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request client_adhesion_requests;
  v_client_id uuid;
  v_client_code text;
  v_sfd_code text;
  v_result jsonb;
BEGIN
  -- 1. Récupérer la demande
  SELECT * INTO v_request
  FROM client_adhesion_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Demande non trouvée ou déjà traitée'
    );
  END IF;
  
  -- 2. Générer le code client
  SELECT code INTO v_sfd_code FROM sfds WHERE id = v_request.sfd_id;
  SELECT generate_client_code(v_sfd_code) INTO v_client_code;
  
  -- 3. Créer le client SFD
  INSERT INTO sfd_clients (
    sfd_id, user_id, full_name, email, phone, address,
    status, client_code, kyc_level
  )
  VALUES (
    v_request.sfd_id, v_request.user_id, v_request.full_name,
    v_request.email, v_request.phone, v_request.address,
    'active', v_client_code, 1
  )
  RETURNING id INTO v_client_id;
  
  -- 4. Créer les 3 comptes (operation, epargne, remboursement)
  INSERT INTO accounts (user_id, sfd_id, account_type, balance, status, currency)
  VALUES 
    (v_request.user_id, v_request.sfd_id, 'operation', 0, 'active', 'FCFA'),
    (v_request.user_id, v_request.sfd_id, 'epargne', 0, 'active', 'FCFA'),
    (v_request.user_id, v_request.sfd_id, 'remboursement', 0, 'active', 'FCFA');
  
  -- 5. Supprimer l'ancien rôle 'user' s'il existe
  DELETE FROM user_roles 
  WHERE user_id = v_request.user_id AND role = 'user';
  
  -- 6. Ajouter le rôle 'client' s'il n'existe pas déjà
  INSERT INTO user_roles (user_id, role)
  VALUES (v_request.user_id, 'client')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- 7. Créer l'association user_sfds si elle n'existe pas
  INSERT INTO user_sfds (user_id, sfd_id, is_default)
  VALUES (v_request.user_id, v_request.sfd_id, true)
  ON CONFLICT (user_id, sfd_id) DO NOTHING;
  
  -- 8. Mettre à jour la demande
  UPDATE client_adhesion_requests
  SET 
    status = 'approved',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW()
  WHERE id = p_request_id;
  
  -- 9. Logger l'action
  INSERT INTO audit_logs (
    user_id, action, category, severity, status, details
  )
  VALUES (
    p_reviewed_by,
    'approve_client_adhesion',
    'client_management',
    'info',
    'success',
    jsonb_build_object(
      'request_id', p_request_id,
      'client_id', v_client_id,
      'client_code', v_client_code,
      'full_name', v_request.full_name
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'client_id', v_client_id,
    'client_code', v_client_code
  );
END;
$$;

-- 3. Créer la fonction pour rejeter une demande
CREATE OR REPLACE FUNCTION reject_client_adhesion(
  p_request_id uuid,
  p_reviewed_by uuid,
  p_rejection_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request client_adhesion_requests;
BEGIN
  -- Récupérer la demande
  SELECT * INTO v_request
  FROM client_adhesion_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Demande non trouvée ou déjà traitée'
    );
  END IF;
  
  -- Mettre à jour la demande
  UPDATE client_adhesion_requests
  SET 
    status = 'rejected',
    reviewed_by = p_reviewed_by,
    reviewed_at = NOW(),
    rejection_reason = p_rejection_reason
  WHERE id = p_request_id;
  
  -- Logger l'action
  INSERT INTO audit_logs (
    user_id, action, category, severity, status, details
  )
  VALUES (
    p_reviewed_by,
    'reject_client_adhesion',
    'client_management',
    'info',
    'success',
    jsonb_build_object(
      'request_id', p_request_id,
      'full_name', v_request.full_name,
      'rejection_reason', p_rejection_reason
    )
  );
  
  RETURN jsonb_build_object('success', true);
END;
$$;