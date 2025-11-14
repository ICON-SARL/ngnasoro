-- Create cash_sessions table if not exists
CREATE TABLE IF NOT EXISTS cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID NOT NULL REFERENCES sfds(id),
  cashier_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  closing_balance NUMERIC,
  station_name TEXT DEFAULT 'Caisse Principale',
  active_qr_code_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cash_operations table if not exists
CREATE TABLE IF NOT EXISTS cash_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES cash_sessions(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  operation_type TEXT NOT NULL CHECK (operation_type IN ('deposit', 'withdrawal', 'opening', 'closing')),
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  client_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cashier_qr_codes table
CREATE TABLE cashier_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_session_id UUID NOT NULL REFERENCES cash_sessions(id) ON DELETE CASCADE,
  sfd_id UUID NOT NULL REFERENCES sfds(id),
  cashier_id UUID NOT NULL,
  qr_code_data TEXT NOT NULL UNIQUE,
  qr_code_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_scanned_at TIMESTAMPTZ,
  scan_count INTEGER NOT NULL DEFAULT 0,
  max_scans INTEGER NOT NULL DEFAULT 1000,
  station_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique partial index for active QR per session
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_qr_per_session 
  ON cashier_qr_codes(cash_session_id) 
  WHERE status = 'active';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cash_sessions_sfd ON cash_sessions(sfd_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_cashier ON cash_sessions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cash_operations_session ON cash_operations(session_id);
CREATE INDEX IF NOT EXISTS idx_cash_operations_transaction ON cash_operations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_cashier_qr_session ON cashier_qr_codes(cash_session_id);
CREATE INDEX IF NOT EXISTS idx_cashier_qr_status ON cashier_qr_codes(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_cashier_qr_hash ON cashier_qr_codes(qr_code_hash);

-- Enable RLS
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashier_qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cash_sessions
DROP POLICY IF EXISTS "Cashiers can view their own sessions" ON cash_sessions;
CREATE POLICY "Cashiers can view their own sessions"
  ON cash_sessions FOR SELECT
  USING (cashier_id = auth.uid());

DROP POLICY IF EXISTS "Cashiers can create sessions" ON cash_sessions;
CREATE POLICY "Cashiers can create sessions"
  ON cash_sessions FOR INSERT
  WITH CHECK (cashier_id = auth.uid());

DROP POLICY IF EXISTS "Cashiers can update their sessions" ON cash_sessions;
CREATE POLICY "Cashiers can update their sessions"
  ON cash_sessions FOR UPDATE
  USING (cashier_id = auth.uid());

DROP POLICY IF EXISTS "SFD admins can view sessions in their SFD" ON cash_sessions;
CREATE POLICY "SFD admins can view sessions in their SFD"
  ON cash_sessions FOR SELECT
  USING (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM user_sfds
      WHERE user_id = auth.uid() AND sfd_id = cash_sessions.sfd_id
    )
  );

-- RLS Policies for cash_operations
DROP POLICY IF EXISTS "Cashiers can view operations in their sessions" ON cash_operations;
CREATE POLICY "Cashiers can view operations in their sessions"
  ON cash_operations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cash_sessions
      WHERE id = cash_operations.session_id AND cashier_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can create operations" ON cash_operations;
CREATE POLICY "System can create operations"
  ON cash_operations FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "SFD admins can view operations" ON cash_operations;
CREATE POLICY "SFD admins can view operations"
  ON cash_operations FOR SELECT
  USING (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM cash_sessions cs
      JOIN user_sfds us ON us.sfd_id = cs.sfd_id
      WHERE cs.id = cash_operations.session_id AND us.user_id = auth.uid()
    )
  );

-- RLS Policies for cashier_qr_codes
DROP POLICY IF EXISTS "Cashiers can view their QR codes" ON cashier_qr_codes;
CREATE POLICY "Cashiers can view their QR codes"
  ON cashier_qr_codes FOR SELECT
  USING (cashier_id = auth.uid());

DROP POLICY IF EXISTS "System can create QR codes" ON cashier_qr_codes;
CREATE POLICY "System can create QR codes"
  ON cashier_qr_codes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can update QR codes" ON cashier_qr_codes;
CREATE POLICY "System can update QR codes"
  ON cashier_qr_codes FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "SFD admins can view QR codes" ON cashier_qr_codes;
CREATE POLICY "SFD admins can view QR codes"
  ON cashier_qr_codes FOR SELECT
  USING (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM user_sfds
      WHERE user_id = auth.uid() AND sfd_id = cashier_qr_codes.sfd_id
    )
  );

-- Trigger to expire QR codes when session closes
CREATE OR REPLACE FUNCTION expire_qr_on_session_close()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND OLD.status = 'open' THEN
    UPDATE cashier_qr_codes
    SET status = 'expired'
    WHERE cash_session_id = NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_expire_qr_on_session_close ON cash_sessions;
CREATE TRIGGER trigger_expire_qr_on_session_close
  AFTER UPDATE ON cash_sessions
  FOR EACH ROW
  EXECUTE FUNCTION expire_qr_on_session_close();

-- Update trigger for cash_sessions
DROP TRIGGER IF EXISTS update_cash_sessions_updated_at ON cash_sessions;
CREATE TRIGGER update_cash_sessions_updated_at
  BEFORE UPDATE ON cash_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();