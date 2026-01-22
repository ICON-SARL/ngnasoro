-- =====================================================
-- MIGRATION: Correction des Policies RLS Permissives
-- Phase 2 - Sécurisation Complète pour Publication Mobile
-- =====================================================

-- 1. CASH_OPERATIONS: Seuls les caissiers de la session peuvent gérer
DROP POLICY IF EXISTS "System can create operations" ON cash_operations;
DROP POLICY IF EXISTS "Cashiers can create operations" ON cash_operations;
CREATE POLICY "Cashiers can manage their session operations" ON cash_operations
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cash_sessions cs
      WHERE cs.id = cash_operations.session_id
      AND cs.cashier_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cash_sessions cs
      WHERE cs.id = cash_operations.session_id
      AND cs.cashier_id = auth.uid()
    )
  );

-- 2. CASHIER_QR_CODES: Seuls les caissiers propriétaires
DROP POLICY IF EXISTS "System can create QR codes" ON cashier_qr_codes;
DROP POLICY IF EXISTS "System can update QR codes" ON cashier_qr_codes;
DROP POLICY IF EXISTS "Cashiers can manage their QR codes" ON cashier_qr_codes;
CREATE POLICY "Cashiers can manage their own QR codes" ON cashier_qr_codes
  FOR ALL TO authenticated
  USING (cashier_id = auth.uid())
  WITH CHECK (cashier_id = auth.uid());

-- 3. COLLABORATIVE_VAULT_INVITATIONS: Membres du vault uniquement
DROP POLICY IF EXISTS "System can manage invitations" ON collaborative_vault_invitations;
DROP POLICY IF EXISTS "Vault admins can manage invitations" ON collaborative_vault_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON collaborative_vault_invitations;
DROP POLICY IF EXISTS "Invited users can view their invitations" ON collaborative_vault_invitations;
CREATE POLICY "Vault members can manage invitations" ON collaborative_vault_invitations
  FOR ALL TO authenticated
  USING (
    invited_by = auth.uid() 
    OR invited_user_id = auth.uid()
    OR public.is_vault_member(vault_id, auth.uid())
  )
  WITH CHECK (
    public.is_vault_member(vault_id, auth.uid())
  );

-- 4. COLLABORATIVE_VAULT_MEMBERS: Membres actifs uniquement
DROP POLICY IF EXISTS "System can manage members" ON collaborative_vault_members;
DROP POLICY IF EXISTS "Vault members can view other members" ON collaborative_vault_members;
DROP POLICY IF EXISTS "Users can manage their own membership" ON collaborative_vault_members;
CREATE POLICY "Vault members can view members" ON collaborative_vault_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() 
    OR public.is_vault_member(vault_id, auth.uid())
  );

CREATE POLICY "Vault admins can manage members" ON collaborative_vault_members
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM collaborative_vault_members cvm
      WHERE cvm.vault_id = collaborative_vault_members.vault_id
      AND cvm.user_id = auth.uid()
      AND cvm.is_admin = true
      AND cvm.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collaborative_vault_members cvm
      WHERE cvm.vault_id = collaborative_vault_members.vault_id
      AND cvm.user_id = auth.uid()
      AND cvm.is_admin = true
      AND cvm.status = 'active'
    )
  );

-- 5. COLLABORATIVE_VAULT_TRANSACTIONS: Membres du vault uniquement
DROP POLICY IF EXISTS "System can record transactions" ON collaborative_vault_transactions;
DROP POLICY IF EXISTS "Vault members can view transactions" ON collaborative_vault_transactions;
DROP POLICY IF EXISTS "Members can create transactions" ON collaborative_vault_transactions;
CREATE POLICY "Vault members can view transactions" ON collaborative_vault_transactions
  FOR SELECT TO authenticated
  USING (public.is_vault_member(vault_id, auth.uid()));

CREATE POLICY "Vault members can create transactions" ON collaborative_vault_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_vault_member(vault_id, auth.uid())
  );

-- 6. COLLABORATIVE_VAULT_WITHDRAWAL_VOTES: Membres actifs uniquement
DROP POLICY IF EXISTS "System can manage votes" ON collaborative_vault_withdrawal_votes;
DROP POLICY IF EXISTS "Vault members can view votes" ON collaborative_vault_withdrawal_votes;
DROP POLICY IF EXISTS "Members can cast votes" ON collaborative_vault_withdrawal_votes;
CREATE POLICY "Vault members can view votes" ON collaborative_vault_withdrawal_votes
  FOR SELECT TO authenticated
  USING (public.is_vault_member(vault_id, auth.uid()));

CREATE POLICY "Vault members can cast their vote" ON collaborative_vault_withdrawal_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_vault_member(vault_id, auth.uid())
    AND EXISTS (
      SELECT 1 FROM collaborative_vault_members cvm
      WHERE cvm.id = collaborative_vault_withdrawal_votes.member_id
      AND cvm.user_id = auth.uid()
    )
  );

-- 7. Sécuriser les fonctions avec search_path
ALTER FUNCTION generate_meref_loan_reference() SET search_path = public;
ALTER FUNCTION calculate_meref_loan_amounts() SET search_path = public;
ALTER FUNCTION update_meref_loan_after_payment() SET search_path = public;

-- 8. Créer une vue publique sécurisée pour les SFDs (sans données sensibles)
CREATE OR REPLACE VIEW sfds_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  code,
  region,
  logo_url,
  status,
  created_at
FROM sfds
WHERE status = 'active';

-- Accorder l'accès à la vue
GRANT SELECT ON sfds_public TO anon, authenticated;