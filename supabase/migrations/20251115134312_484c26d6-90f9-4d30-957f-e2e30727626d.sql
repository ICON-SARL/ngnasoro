-- Créer la table vaults pour les coffres individuels
CREATE TABLE IF NOT EXISTS vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sfd_id UUID NOT NULL REFERENCES sfds(id) ON DELETE CASCADE,
  vault_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC DEFAULT 0 CHECK (current_amount >= 0),
  type TEXT NOT NULL DEFAULT 'simple' CHECK (type IN ('simple', 'locked', 'project')),
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_vaults_user_id ON vaults(user_id);
CREATE INDEX IF NOT EXISTS idx_vaults_sfd_id ON vaults(sfd_id);
CREATE INDEX IF NOT EXISTS idx_vaults_status ON vaults(status);

-- Activer RLS
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres coffres
CREATE POLICY "Users can view their own vaults"
ON vaults FOR SELECT
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres coffres
CREATE POLICY "Users can create their own vaults"
ON vaults FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres coffres
CREATE POLICY "Users can update their own vaults"
ON vaults FOR UPDATE
USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres coffres
CREATE POLICY "Users can delete their own vaults"
ON vaults FOR DELETE
USING (auth.uid() = user_id);

-- SFD admins peuvent voir les coffres de leur SFD
CREATE POLICY "SFD admins can view vaults in their SFD"
ON vaults FOR SELECT
USING (
  has_role(auth.uid(), 'sfd_admin'::app_role) AND
  EXISTS (
    SELECT 1 FROM user_sfds
    WHERE user_id = auth.uid() AND sfd_id = vaults.sfd_id
  )
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_vaults_updated_at
BEFORE UPDATE ON vaults
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();