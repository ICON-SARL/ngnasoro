-- Création des tables pour le système de Tontine

-- Table principale des tontines
CREATE TABLE tontines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID NOT NULL REFERENCES sfds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  contribution_amount NUMERIC NOT NULL CHECK (contribution_amount > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'bi-weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  max_members INTEGER DEFAULT 10 CHECK (max_members > 0),
  current_members INTEGER DEFAULT 0,
  total_collected NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des membres de tontine
CREATE TABLE tontine_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID NOT NULL REFERENCES tontines(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES sfd_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  total_contributed NUMERIC DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'withdrawn')),
  UNIQUE(tontine_id, client_id)
);

-- Table des contributions
CREATE TABLE tontine_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tontine_id UUID NOT NULL REFERENCES tontines(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES tontine_members(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  contribution_date DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer')),
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activation RLS
ALTER TABLE tontines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tontine_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tontine_contributions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour tontines
CREATE POLICY "Users can view tontines in their SFD"
  ON tontines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_sfds
      WHERE user_id = auth.uid() AND sfd_id = tontines.sfd_id
    )
  );

CREATE POLICY "SFD admins can manage tontines"
  ON tontines FOR ALL
  USING (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM user_sfds
      WHERE user_id = auth.uid() AND sfd_id = tontines.sfd_id
    )
  );

-- Politiques RLS pour tontine_members
CREATE POLICY "Members can view their tontine memberships"
  ON tontine_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can join tontines"
  ON tontine_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "SFD admins can manage tontine members"
  ON tontine_members FOR ALL
  USING (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM tontines t
      JOIN user_sfds us ON us.sfd_id = t.sfd_id
      WHERE t.id = tontine_members.tontine_id
      AND us.user_id = auth.uid()
    )
  );

-- Politiques RLS pour tontine_contributions
CREATE POLICY "Members can view their contributions"
  ON tontine_contributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tontine_members tm
      WHERE tm.id = tontine_contributions.member_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create contributions"
  ON tontine_contributions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tontine_members tm
      WHERE tm.id = tontine_contributions.member_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "SFD admins can manage contributions"
  ON tontine_contributions FOR ALL
  USING (
    has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM tontines t
      JOIN user_sfds us ON us.sfd_id = t.sfd_id
      WHERE t.id = tontine_contributions.tontine_id
      AND us.user_id = auth.uid()
    )
  );

-- Indexes pour performance
CREATE INDEX idx_tontines_sfd_id ON tontines(sfd_id);
CREATE INDEX idx_tontines_status ON tontines(status);
CREATE INDEX idx_tontine_members_tontine_id ON tontine_members(tontine_id);
CREATE INDEX idx_tontine_members_user_id ON tontine_members(user_id);
CREATE INDEX idx_tontine_contributions_tontine_id ON tontine_contributions(tontine_id);
CREATE INDEX idx_tontine_contributions_member_id ON tontine_contributions(member_id);

-- Trigger pour mettre à jour current_members dans tontines
CREATE OR REPLACE FUNCTION update_tontine_members_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tontines
  SET current_members = (
    SELECT COUNT(*) FROM tontine_members
    WHERE tontine_id = COALESCE(NEW.tontine_id, OLD.tontine_id)
    AND status = 'active'
  )
  WHERE id = COALESCE(NEW.tontine_id, OLD.tontine_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tontine_members_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON tontine_members
FOR EACH ROW
EXECUTE FUNCTION update_tontine_members_count();

-- Trigger pour mettre à jour total_contributed
CREATE OR REPLACE FUNCTION update_member_contributions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tontine_members
  SET total_contributed = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM tontine_contributions
    WHERE member_id = NEW.member_id
    AND status = 'completed'
  )
  WHERE id = NEW.member_id;
  
  UPDATE tontines
  SET total_collected = (
    SELECT COALESCE(SUM(amount), 0)
    FROM tontine_contributions
    WHERE tontine_id = NEW.tontine_id
    AND status = 'completed'
  )
  WHERE id = NEW.tontine_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contributions_trigger
AFTER INSERT OR UPDATE ON tontine_contributions
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_member_contributions();