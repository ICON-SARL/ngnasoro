-- ============================================
-- COFFRES COLLABORATIFS - SYSTÈME COMPLET
-- ============================================

-- 1. TYPES ENUMS
CREATE TYPE vault_visibility AS ENUM ('private', 'invite_only', 'public');
CREATE TYPE withdrawal_rule AS ENUM ('creator_only', 'majority_vote', 'unanimous');
CREATE TYPE member_status AS ENUM ('pending', 'active', 'removed');
CREATE TYPE vault_transaction_type AS ENUM ('deposit', 'withdrawal', 'penalty', 'bonus');

-- 2. TABLE: collaborative_vaults
CREATE TABLE collaborative_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  sfd_id UUID NOT NULL REFERENCES sfds(id) ON DELETE CASCADE,
  vault_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC DEFAULT 0 CHECK (current_amount >= 0),
  
  visibility vault_visibility DEFAULT 'private',
  withdrawal_rule withdrawal_rule DEFAULT 'creator_only',
  allow_withdrawal_before_goal BOOLEAN DEFAULT false,
  
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'goal_reached', 'closed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collab_vaults_creator ON collaborative_vaults(creator_id);
CREATE INDEX idx_collab_vaults_sfd ON collaborative_vaults(sfd_id);
CREATE INDEX idx_collab_vaults_status ON collaborative_vaults(status);

-- 3. TABLE: collaborative_vault_members
CREATE TABLE collaborative_vault_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES collaborative_vaults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  invited_by UUID,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  status member_status DEFAULT 'pending',
  total_contributed NUMERIC DEFAULT 0,
  
  is_admin BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(vault_id, user_id)
);

CREATE INDEX idx_collab_members_vault ON collaborative_vault_members(vault_id);
CREATE INDEX idx_collab_members_user ON collaborative_vault_members(user_id);

-- 4. TABLE: collaborative_vault_transactions
CREATE TABLE collaborative_vault_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES collaborative_vaults(id) ON DELETE CASCADE,
  member_id UUID REFERENCES collaborative_vault_members(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  
  transaction_type vault_transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  
  description TEXT,
  payment_method TEXT,
  reference TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collab_transactions_vault ON collaborative_vault_transactions(vault_id);
CREATE INDEX idx_collab_transactions_user ON collaborative_vault_transactions(user_id);
CREATE INDEX idx_collab_transactions_created ON collaborative_vault_transactions(created_at DESC);

-- 5. TABLE: collaborative_vault_invitations
CREATE TABLE collaborative_vault_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES collaborative_vaults(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  
  phone TEXT,
  email TEXT,
  invited_user_id UUID,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  responded_at TIMESTAMPTZ
);

CREATE INDEX idx_collab_invitations_vault ON collaborative_vault_invitations(vault_id);
CREATE INDEX idx_collab_invitations_user ON collaborative_vault_invitations(invited_user_id);

-- 6. TABLE: collaborative_vault_withdrawal_requests
CREATE TABLE collaborative_vault_withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES collaborative_vaults(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  
  amount NUMERIC NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  
  votes_yes INTEGER DEFAULT 0,
  votes_no INTEGER DEFAULT 0,
  total_votes_required INTEGER,
  
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_withdrawal_requests_vault ON collaborative_vault_withdrawal_requests(vault_id);
CREATE INDEX idx_withdrawal_requests_status ON collaborative_vault_withdrawal_requests(status);

-- 7. TABLE: collaborative_vault_withdrawal_votes
CREATE TABLE collaborative_vault_withdrawal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES collaborative_vaults(id) ON DELETE CASCADE,
  withdrawal_request_id UUID NOT NULL REFERENCES collaborative_vault_withdrawal_requests(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES collaborative_vault_members(id),
  
  vote BOOLEAN NOT NULL,
  comment TEXT,
  
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(withdrawal_request_id, member_id)
);

CREATE INDEX idx_withdrawal_votes_request ON collaborative_vault_withdrawal_votes(withdrawal_request_id);

-- 8. RLS POLICIES

-- collaborative_vaults
ALTER TABLE collaborative_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vaults they're members of"
ON collaborative_vaults FOR SELECT
USING (
  creator_id = auth.uid() OR
  visibility = 'public' OR
  EXISTS (
    SELECT 1 FROM collaborative_vault_members
    WHERE vault_id = collaborative_vaults.id
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "Authenticated users can create vaults"
ON collaborative_vaults FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their vaults"
ON collaborative_vaults FOR UPDATE
USING (creator_id = auth.uid());

-- collaborative_vault_members
ALTER TABLE collaborative_vault_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their memberships"
ON collaborative_vault_members FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM collaborative_vaults
    WHERE id = collaborative_vault_members.vault_id
    AND creator_id = auth.uid()
  )
);

CREATE POLICY "System can manage members"
ON collaborative_vault_members FOR ALL
USING (true)
WITH CHECK (true);

-- collaborative_vault_transactions
ALTER TABLE collaborative_vault_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions in their vaults"
ON collaborative_vault_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collaborative_vault_members
    WHERE vault_id = collaborative_vault_transactions.vault_id
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "System can create transactions"
ON collaborative_vault_transactions FOR INSERT
WITH CHECK (true);

-- collaborative_vault_invitations
ALTER TABLE collaborative_vault_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their invitations"
ON collaborative_vault_invitations FOR SELECT
USING (
  invited_by = auth.uid() OR
  invited_user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM collaborative_vaults
    WHERE id = collaborative_vault_invitations.vault_id
    AND creator_id = auth.uid()
  )
);

CREATE POLICY "System can manage invitations"
ON collaborative_vault_invitations FOR ALL
USING (true)
WITH CHECK (true);

-- collaborative_vault_withdrawal_requests
ALTER TABLE collaborative_vault_withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view withdrawal requests"
ON collaborative_vault_withdrawal_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collaborative_vault_members
    WHERE vault_id = collaborative_vault_withdrawal_requests.vault_id
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "System can manage withdrawal requests"
ON collaborative_vault_withdrawal_requests FOR ALL
USING (true)
WITH CHECK (true);

-- collaborative_vault_withdrawal_votes
ALTER TABLE collaborative_vault_withdrawal_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view votes"
ON collaborative_vault_withdrawal_votes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM collaborative_vault_members
    WHERE vault_id = collaborative_vault_withdrawal_votes.vault_id
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "System can manage votes"
ON collaborative_vault_withdrawal_votes FOR ALL
USING (true)
WITH CHECK (true);

-- 9. TRIGGERS AND FUNCTIONS

-- Auto-update current_amount on transaction
CREATE OR REPLACE FUNCTION update_collab_vault_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.transaction_type = 'deposit' THEN
      UPDATE collaborative_vaults
      SET current_amount = current_amount + NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.vault_id;
      
      UPDATE collaborative_vault_members
      SET total_contributed = total_contributed + NEW.amount
      WHERE vault_id = NEW.vault_id AND user_id = NEW.user_id;
    ELSIF NEW.transaction_type = 'withdrawal' THEN
      UPDATE collaborative_vaults
      SET current_amount = current_amount - NEW.amount,
          updated_at = NOW()
      WHERE id = NEW.vault_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_collab_vault_amount
AFTER INSERT ON collaborative_vault_transactions
FOR EACH ROW EXECUTE FUNCTION update_collab_vault_amount();

-- Auto-add creator as admin member
CREATE OR REPLACE FUNCTION auto_add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO collaborative_vault_members (vault_id, user_id, status, is_admin)
  VALUES (NEW.id, NEW.creator_id, 'active', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_auto_add_creator
AFTER INSERT ON collaborative_vaults
FOR EACH ROW EXECUTE FUNCTION auto_add_creator_as_member();

-- Function to notify vault members
CREATE OR REPLACE FUNCTION notify_vault_members(
  _vault_id UUID,
  _title TEXT,
  _message TEXT,
  _type TEXT,
  _exclude_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_notifications (user_id, title, message, type)
  SELECT 
    user_id,
    _title,
    _message,
    _type
  FROM collaborative_vault_members
  WHERE vault_id = _vault_id
    AND status = 'active'
    AND (_exclude_user_id IS NULL OR user_id != _exclude_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;