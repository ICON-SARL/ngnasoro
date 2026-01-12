-- Table vault_contributions pour tracer les dépôts individuels
CREATE TABLE vault_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  source_account_id UUID REFERENCES accounts(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table vault_withdrawals pour tracer les retraits individuels
CREATE TABLE vault_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  destination_account_id UUID REFERENCES accounts(id),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_vault_contributions_vault_id ON vault_contributions(vault_id);
CREATE INDEX idx_vault_contributions_user_id ON vault_contributions(user_id);
CREATE INDEX idx_vault_withdrawals_vault_id ON vault_withdrawals(vault_id);
CREATE INDEX idx_vault_withdrawals_user_id ON vault_withdrawals(user_id);

-- Activer RLS
ALTER TABLE vault_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_withdrawals ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour vault_contributions
CREATE POLICY "Users can view their vault contributions" ON vault_contributions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM vaults WHERE id = vault_id AND user_id = auth.uid())
  );

CREATE POLICY "System can insert vault contributions" ON vault_contributions
  FOR INSERT WITH CHECK (true);

-- Politiques RLS pour vault_withdrawals
CREATE POLICY "Users can view their vault withdrawals" ON vault_withdrawals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM vaults WHERE id = vault_id AND user_id = auth.uid())
  );

CREATE POLICY "System can insert vault withdrawals" ON vault_withdrawals
  FOR INSERT WITH CHECK (true);

-- Corriger les politiques RLS trop permissives sur collaborative_vault_members
DROP POLICY IF EXISTS "System can manage members" ON collaborative_vault_members;

CREATE POLICY "Vault creators and admins can insert members" ON collaborative_vault_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM collaborative_vaults cv
      WHERE cv.id = vault_id AND cv.creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM collaborative_vault_members cvm
      WHERE cvm.vault_id = collaborative_vault_members.vault_id
        AND cvm.user_id = auth.uid()
        AND cvm.is_admin = true
        AND cvm.status = 'active'
    ) OR
    user_id = auth.uid()
  );

CREATE POLICY "Vault creators can update members" ON collaborative_vault_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM collaborative_vaults cv
      WHERE cv.id = vault_id AND cv.creator_id = auth.uid()
    )
  );

CREATE POLICY "Vault creators can delete members" ON collaborative_vault_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM collaborative_vaults cv
      WHERE cv.id = vault_id AND cv.creator_id = auth.uid()
    )
  );