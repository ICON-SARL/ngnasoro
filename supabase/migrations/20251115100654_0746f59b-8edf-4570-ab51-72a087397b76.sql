-- ============================================
-- PHASE 1: Création table loan_payment_schedules
-- ============================================

CREATE TABLE IF NOT EXISTS loan_payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES sfd_loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  principal_amount NUMERIC NOT NULL,
  interest_amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  remaining_principal NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partially_paid')),
  paid_amount NUMERIC DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  late_fee NUMERIC DEFAULT 0,
  days_overdue INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(loan_id, installment_number)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_schedules_loan_id ON loan_payment_schedules(loan_id);
CREATE INDEX idx_schedules_due_date ON loan_payment_schedules(due_date);
CREATE INDEX idx_schedules_status ON loan_payment_schedules(status);

-- Trigger pour updated_at
CREATE TRIGGER update_loan_schedules_updated_at
  BEFORE UPDATE ON loan_payment_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS Policies pour loan_payment_schedules
-- ============================================

ALTER TABLE loan_payment_schedules ENABLE ROW LEVEL SECURITY;

-- Clients voient leur propre échéancier
CREATE POLICY "clients_view_own_schedules" ON loan_payment_schedules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sfd_loans sl
    JOIN sfd_clients sc ON sc.id = sl.client_id
    WHERE sl.id = loan_payment_schedules.loan_id
    AND sc.user_id = auth.uid()
  )
);

-- SFD admins gèrent les échéanciers de leur SFD
CREATE POLICY "sfd_admins_manage_schedules" ON loan_payment_schedules
FOR ALL USING (
  has_role(auth.uid(), 'sfd_admin') 
  AND EXISTS (
    SELECT 1 FROM sfd_loans sl
    JOIN user_sfds us ON us.sfd_id = sl.sfd_id
    WHERE sl.id = loan_payment_schedules.loan_id
    AND us.user_id = auth.uid()
  )
);

-- Système peut créer des échéanciers
CREATE POLICY "system_create_schedules" ON loan_payment_schedules
FOR INSERT WITH CHECK (true);

-- ============================================
-- Extension table loan_payments
-- ============================================

ALTER TABLE loan_payments
ADD COLUMN IF NOT EXISTS principal_amount NUMERIC,
ADD COLUMN IF NOT EXISTS interest_amount NUMERIC,
ADD COLUMN IF NOT EXISTS late_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS installment_number INTEGER,
ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES loan_payment_schedules(id);

-- ============================================
-- Fonction helper pour calculer date future
-- ============================================

CREATE OR REPLACE FUNCTION add_months_to_date(base_date DATE, months_to_add INTEGER)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN base_date + (months_to_add || ' months')::INTERVAL;
END;
$$;