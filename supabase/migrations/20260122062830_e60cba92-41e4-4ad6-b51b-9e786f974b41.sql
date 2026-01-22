-- =====================================================
-- MIGRATION FINALE: Correction des 7 dernières policies permissives
-- =====================================================

-- 1. AUDIT_LOGS: Autoriser uniquement les utilisateurs authentifiés à créer leurs propres logs
DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can create audit logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 2. COLLABORATIVE_VAULT_TRANSACTIONS: Déjà corrigé, mais supprimer l'ancienne policy si elle existe
DROP POLICY IF EXISTS "System can create transactions" ON collaborative_vault_transactions;
-- La policy "Vault members can create transactions" existe déjà

-- 3. COLLABORATIVE_VAULT_WITHDRAWAL_REQUESTS: Corriger la policy ALL permissive
DROP POLICY IF EXISTS "System can manage withdrawal requests" ON collaborative_vault_withdrawal_requests;
CREATE POLICY "Vault members can manage withdrawal requests" ON collaborative_vault_withdrawal_requests
  FOR ALL TO authenticated
  USING (
    requested_by = auth.uid()
    OR public.is_vault_member(vault_id, auth.uid())
  )
  WITH CHECK (
    requested_by = auth.uid()
    AND public.is_vault_member(vault_id, auth.uid())
  );

-- 4. LOAN_PAYMENT_SCHEDULES: Seuls les admins SFD peuvent créer des échéanciers
DROP POLICY IF EXISTS "system_create_schedules" ON loan_payment_schedules;
CREATE POLICY "SFD admins can create payment schedules" ON loan_payment_schedules
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sfd_loans l
      JOIN user_sfds us ON us.sfd_id = l.sfd_id
      WHERE l.id = loan_payment_schedules.loan_id
      AND us.user_id = auth.uid()
    )
    AND (public.has_role(auth.uid(), 'sfd_admin') OR public.has_role(auth.uid(), 'admin'))
  );

-- 5. MOBILE_MONEY_WEBHOOKS: Seuls les admins peuvent gérer les webhooks
DROP POLICY IF EXISTS "System can create webhooks" ON mobile_money_webhooks;
CREATE POLICY "Admins can manage webhooks" ON mobile_money_webhooks
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'sfd_admin')
  );

-- 6. VAULT_CONTRIBUTIONS: Membres du vault uniquement
DROP POLICY IF EXISTS "System can insert vault contributions" ON vault_contributions;
CREATE POLICY "Vault members can insert contributions" ON vault_contributions
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_vault_member(vault_id, auth.uid())
  );

-- 7. VAULT_WITHDRAWALS: Membres du vault uniquement
DROP POLICY IF EXISTS "System can insert vault withdrawals" ON vault_withdrawals;
CREATE POLICY "Vault members can insert withdrawals" ON vault_withdrawals
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_vault_member(vault_id, auth.uid())
  );

-- 8. Corriger la vue Security Definer (remplacer par Security Invoker)
DROP VIEW IF EXISTS sfds_public;
CREATE VIEW sfds_public AS
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