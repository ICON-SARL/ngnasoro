-- ============================================================
-- PHASE 1: SECURITY HARDENING - FIXED MIGRATION
-- ============================================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Vault members can view transactions" ON collaborative_vault_transactions;
DROP POLICY IF EXISTS "Vault members can create transactions" ON collaborative_vault_transactions;

-- 3. Fix collaborative_vault_transactions policies
CREATE POLICY "Vault members can view transactions"
ON collaborative_vault_transactions FOR SELECT
TO authenticated
USING (
  public.is_vault_member(vault_id, auth.uid())
);

CREATE POLICY "Vault members can create transactions"
ON collaborative_vault_transactions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  public.is_vault_member(vault_id, auth.uid())
);

-- 5. Fix cash_operations policies
DROP POLICY IF EXISTS "Cashiers can manage their session operations" ON cash_operations;

CREATE POLICY "Cashiers can manage their session operations"
ON cash_operations FOR ALL
TO authenticated
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

-- 6. Fix cashier_qr_codes policies
DROP POLICY IF EXISTS "Cashiers can manage their own QR codes" ON cashier_qr_codes;

CREATE POLICY "Cashiers can manage their own QR codes"
ON cashier_qr_codes FOR ALL
TO authenticated
USING (cashier_id = auth.uid())
WITH CHECK (cashier_id = auth.uid());

-- 7. Fix audit_logs policies
DROP POLICY IF EXISTS "System and users can create audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;

CREATE POLICY "System and users can create audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view their own audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
);

-- 8. Secure functions with search_path (idempotent)
ALTER FUNCTION generate_meref_loan_reference() SET search_path = public;
ALTER FUNCTION calculate_meref_loan_amounts() SET search_path = public;
ALTER FUNCTION update_meref_loan_after_payment() SET search_path = public;