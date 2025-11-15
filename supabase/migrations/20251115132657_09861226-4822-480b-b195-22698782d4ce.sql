-- Rendre vault_account_id nullable pour permettre de gérer le solde directement dans collaborative_vaults
ALTER TABLE collaborative_vaults 
ALTER COLUMN vault_account_id DROP NOT NULL;

-- Mettre à jour les coffres existants pour utiliser current_amount au lieu de accounts
UPDATE collaborative_vaults 
SET vault_account_id = NULL 
WHERE vault_account_id IS NOT NULL;