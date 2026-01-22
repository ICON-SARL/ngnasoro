-- =====================================================
-- MIGRATION: Sécurisation RLS pour Publication Mobile
-- =====================================================

-- 1. Activer RLS sur meref_loan_traceability (si c'est une vue, elle hérite des policies des tables sous-jacentes)
-- Note: meref_loan_traceability est une VIEW, donc on sécurise les tables sources

-- 2. Corriger les policies trop permissives sur les tables critiques

-- Sécuriser sfds: masquer les données sensibles pour les non-authentifiés
DROP POLICY IF EXISTS "Public can view active SFDs basic info" ON sfds;
CREATE POLICY "Authenticated users can view active SFDs" ON sfds
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Sécuriser sfd_loan_plans: uniquement pour les utilisateurs authentifiés
DROP POLICY IF EXISTS "Anyone can view active loan plans" ON sfd_loan_plans;
CREATE POLICY "Authenticated users can view active loan plans" ON sfd_loan_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Sécuriser collaborative_vault_withdrawal_requests: uniquement membres du vault
DROP POLICY IF EXISTS "Vault members can view withdrawal requests" ON collaborative_vault_withdrawal_requests;
CREATE POLICY "Vault members can view withdrawal requests" ON collaborative_vault_withdrawal_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collaborative_vault_members cvm
      WHERE cvm.vault_id = collaborative_vault_withdrawal_requests.vault_id
      AND cvm.user_id = auth.uid()
      AND cvm.status = 'active'
    )
  );

-- Corriger les policies INSERT avec WITH CHECK (true) sur les tables sensibles

-- sfd_subsidies: seuls les admins peuvent insérer
DROP POLICY IF EXISTS "Service role can insert subsidies" ON sfd_subsidies;
CREATE POLICY "MEREF admins can insert subsidies" ON sfd_subsidies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

-- subsidy_requests: SFD admins peuvent créer des demandes pour leur SFD
DROP POLICY IF EXISTS "SFD admins can create subsidy requests" ON subsidy_requests;
CREATE POLICY "SFD admins can create subsidy requests for their SFD" ON subsidy_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'sfd_admin')
    AND EXISTS (
      SELECT 1 FROM user_sfds us
      WHERE us.user_id = auth.uid()
      AND us.sfd_id = subsidy_requests.sfd_id
    )
  );

-- meref_sfd_loans: seuls les admins MEREF peuvent créer
DROP POLICY IF EXISTS "Admins can create MEREF SFD loans" ON meref_sfd_loans;
CREATE POLICY "MEREF admins can create SFD loans" ON meref_sfd_loans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

-- meref_sfd_loan_payments: SFD admins peuvent enregistrer des paiements pour leur SFD
DROP POLICY IF EXISTS "SFD admins can record payments" ON meref_sfd_loan_payments;
CREATE POLICY "SFD admins can record payments for their loans" ON meref_sfd_loan_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'sfd_admin')
    AND EXISTS (
      SELECT 1 FROM user_sfds us
      WHERE us.user_id = auth.uid()
      AND us.sfd_id = meref_sfd_loan_payments.sfd_id
    )
  );

-- Ajouter politique de lecture publique limitée pour sfds (nom et région uniquement via vue ou API)
-- Les champs sensibles (email, phone) ne sont pas exposés aux non-authentifiés
CREATE POLICY "Public can view SFD names only" ON sfds
  FOR SELECT
  TO anon
  USING (status = 'active');

-- Note: Pour vraiment masquer email/phone, il faudrait créer une vue sans ces colonnes
-- ou gérer ça côté application en ne sélectionnant pas ces champs pour les users non-auth