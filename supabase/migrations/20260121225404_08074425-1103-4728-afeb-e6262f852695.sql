
-- =====================================================
-- SYSTÈME DE PRÊTS MEREF AUX SFD AVEC TRAÇABILITÉ
-- =====================================================

-- 1. Table des prêts MEREF octroyés aux SFD
CREATE TABLE IF NOT EXISTS meref_sfd_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES sfds(id) NOT NULL,
  
  -- Montant et conditions
  amount NUMERIC NOT NULL CHECK (amount > 0),
  interest_rate NUMERIC DEFAULT 5.0 CHECK (interest_rate >= 0),
  duration_months INTEGER DEFAULT 24 CHECK (duration_months > 0),
  monthly_payment NUMERIC,
  total_amount NUMERIC,
  remaining_amount NUMERIC,
  
  -- Statut et objectif
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'defaulted')),
  purpose TEXT NOT NULL,
  justification TEXT,
  
  -- Validation MEREF
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  disbursed_at TIMESTAMPTZ,
  
  -- Suivi des paiements
  next_payment_date DATE,
  last_payment_date DATE,
  payments_made INTEGER DEFAULT 0,
  
  -- Traçabilité
  reference TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table des remboursements SFD vers MEREF
CREATE TABLE IF NOT EXISTS meref_sfd_loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meref_loan_id UUID REFERENCES meref_sfd_loans(id) NOT NULL,
  sfd_id UUID REFERENCES sfds(id) NOT NULL,
  
  amount NUMERIC NOT NULL CHECK (amount > 0),
  principal_amount NUMERIC,
  interest_amount NUMERIC,
  payment_method TEXT DEFAULT 'bank_transfer',
  reference TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  
  recorded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Ajouter colonne de traçabilité dans sfd_loans
ALTER TABLE sfd_loans 
  ADD COLUMN IF NOT EXISTS meref_source_loan_id UUID REFERENCES meref_sfd_loans(id),
  ADD COLUMN IF NOT EXISTS funded_by_meref BOOLEAN DEFAULT false;

-- 4. Fonction pour générer la référence automatique
CREATE OR REPLACE FUNCTION generate_meref_loan_reference()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  sfd_code TEXT;
BEGIN
  year_suffix := to_char(CURRENT_DATE, 'YYYY');
  
  SELECT code INTO sfd_code FROM sfds WHERE id = NEW.sfd_id;
  IF sfd_code IS NULL THEN
    sfd_code := 'SFD';
  END IF;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference FROM '[0-9]+$') AS INTEGER)
  ), 0) + 1 INTO sequence_num
  FROM meref_sfd_loans
  WHERE reference LIKE 'MEREF-' || sfd_code || '-' || year_suffix || '-%';
  
  NEW.reference := 'MEREF-' || sfd_code || '-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_meref_loan_reference
  BEFORE INSERT ON meref_sfd_loans
  FOR EACH ROW
  WHEN (NEW.reference IS NULL)
  EXECUTE FUNCTION generate_meref_loan_reference();

-- 5. Fonction pour calculer les montants du prêt
CREATE OR REPLACE FUNCTION calculate_meref_loan_amounts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_amount := NEW.amount * (1 + (NEW.interest_rate / 100));
  NEW.monthly_payment := NEW.total_amount / NEW.duration_months;
  NEW.remaining_amount := NEW.total_amount;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_meref_loan_amounts
  BEFORE INSERT OR UPDATE OF amount, interest_rate, duration_months ON meref_sfd_loans
  FOR EACH ROW
  EXECUTE FUNCTION calculate_meref_loan_amounts();

-- 6. Trigger pour mettre à jour le remaining_amount après paiement
CREATE OR REPLACE FUNCTION update_meref_loan_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE meref_sfd_loans
  SET 
    remaining_amount = remaining_amount - NEW.amount,
    last_payment_date = CURRENT_DATE,
    payments_made = payments_made + 1,
    next_payment_date = CURRENT_DATE + INTERVAL '1 month',
    status = CASE 
      WHEN remaining_amount - NEW.amount <= 0 THEN 'completed'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.meref_loan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meref_loan_after_payment
  AFTER INSERT ON meref_sfd_loan_payments
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_meref_loan_after_payment();

-- 7. Vue de traçabilité complète MEREF → SFD → Client
CREATE OR REPLACE VIEW meref_loan_traceability AS
SELECT 
  msl.id as meref_loan_id,
  msl.reference as meref_reference,
  msl.amount as meref_amount,
  msl.remaining_amount as meref_remaining,
  msl.status as meref_status,
  msl.created_at as meref_created_at,
  s.id as sfd_id,
  s.name as sfd_name,
  s.code as sfd_code,
  sl.id as client_loan_id,
  sl.amount as client_loan_amount,
  sl.remaining_amount as client_remaining,
  sl.status as client_loan_status,
  sc.id as client_id,
  sc.full_name as client_name,
  sc.phone as client_phone
FROM meref_sfd_loans msl
JOIN sfds s ON msl.sfd_id = s.id
LEFT JOIN sfd_loans sl ON sl.meref_source_loan_id = msl.id
LEFT JOIN sfd_clients sc ON sl.client_id = sc.id;

-- 8. Index pour performance
CREATE INDEX IF NOT EXISTS idx_meref_sfd_loans_sfd_id ON meref_sfd_loans(sfd_id);
CREATE INDEX IF NOT EXISTS idx_meref_sfd_loans_status ON meref_sfd_loans(status);
CREATE INDEX IF NOT EXISTS idx_meref_sfd_loans_reference ON meref_sfd_loans(reference);
CREATE INDEX IF NOT EXISTS idx_meref_sfd_loan_payments_loan_id ON meref_sfd_loan_payments(meref_loan_id);
CREATE INDEX IF NOT EXISTS idx_sfd_loans_meref_source ON sfd_loans(meref_source_loan_id) WHERE meref_source_loan_id IS NOT NULL;

-- 9. RLS Policies pour meref_sfd_loans
ALTER TABLE meref_sfd_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all MEREF SFD loans"
  ON meref_sfd_loans FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "SFD admins can view their MEREF loans"
  ON meref_sfd_loans FOR SELECT
  USING (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM user_sfds
      WHERE user_sfds.user_id = auth.uid()
      AND user_sfds.sfd_id = meref_sfd_loans.sfd_id
    )
  );

CREATE POLICY "SFD admins can create loan requests"
  ON meref_sfd_loans FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM user_sfds
      WHERE user_sfds.user_id = auth.uid()
      AND user_sfds.sfd_id = meref_sfd_loans.sfd_id
    )
  );

-- 10. RLS Policies pour meref_sfd_loan_payments
ALTER TABLE meref_sfd_loan_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all MEREF loan payments"
  ON meref_sfd_loan_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "SFD admins can view their loan payments"
  ON meref_sfd_loan_payments FOR SELECT
  USING (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM user_sfds
      WHERE user_sfds.user_id = auth.uid()
      AND user_sfds.sfd_id = meref_sfd_loan_payments.sfd_id
    )
  );

CREATE POLICY "SFD admins can record payments"
  ON meref_sfd_loan_payments FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM user_sfds
      WHERE user_sfds.user_id = auth.uid()
      AND user_sfds.sfd_id = meref_sfd_loan_payments.sfd_id
    )
  );
