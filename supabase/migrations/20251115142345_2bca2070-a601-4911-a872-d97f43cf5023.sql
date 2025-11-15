-- Migration: Ajouter les foreign keys manquantes pour les tables collaborative_vault

-- 1. Nettoyer les données orphelines dans collaborative_vault_members
DELETE FROM collaborative_vault_members
WHERE user_id NOT IN (SELECT id FROM profiles);

-- 2. Ajouter foreign key pour collaborative_vault_members.user_id
ALTER TABLE collaborative_vault_members
ADD CONSTRAINT fk_collaborative_vault_members_user_id
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Nettoyer les données orphelines dans collaborative_vault_transactions
DELETE FROM collaborative_vault_transactions
WHERE user_id NOT IN (SELECT id FROM profiles);

-- 4. Ajouter foreign key pour collaborative_vault_transactions.user_id
ALTER TABLE collaborative_vault_transactions
ADD CONSTRAINT fk_collaborative_vault_transactions_user_id
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 5. Nettoyer les données orphelines dans collaborative_vault_invitations
DELETE FROM collaborative_vault_invitations
WHERE invited_by NOT IN (SELECT id FROM profiles);

DELETE FROM collaborative_vault_invitations
WHERE invited_user_id IS NOT NULL 
AND invited_user_id NOT IN (SELECT id FROM profiles);

-- 6. Ajouter foreign keys pour collaborative_vault_invitations
ALTER TABLE collaborative_vault_invitations
ADD CONSTRAINT fk_collaborative_vault_invitations_invited_by
FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE collaborative_vault_invitations
ADD CONSTRAINT fk_collaborative_vault_invitations_invited_user_id
FOREIGN KEY (invited_user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 7. Nettoyer les données orphelines dans collaborative_vault_withdrawal_requests
DELETE FROM collaborative_vault_withdrawal_requests
WHERE requested_by NOT IN (SELECT id FROM profiles);

-- 8. Ajouter foreign key pour collaborative_vault_withdrawal_requests
ALTER TABLE collaborative_vault_withdrawal_requests
ADD CONSTRAINT fk_collaborative_vault_withdrawal_requests_requested_by
FOREIGN KEY (requested_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- 9. Créer un index pour améliorer les performances des joins
CREATE INDEX IF NOT EXISTS idx_collaborative_vault_members_user_id ON collaborative_vault_members(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_vault_transactions_user_id ON collaborative_vault_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_vault_invitations_invited_user_id ON collaborative_vault_invitations(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_collaborative_vault_invitations_invited_by ON collaborative_vault_invitations(invited_by);