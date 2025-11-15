-- Corriger le solde actuel du coffre collaboratif basé sur les vraies transactions
UPDATE collaborative_vaults cv
SET current_amount = (
  SELECT COALESCE(SUM(cvt.amount), 0)
  FROM collaborative_vault_transactions cvt
  WHERE cvt.vault_id = cv.id 
  AND cvt.transaction_type = 'deposit'
)
WHERE id = '437cfd87-91d8-4dce-b21b-b890f341a5c8';