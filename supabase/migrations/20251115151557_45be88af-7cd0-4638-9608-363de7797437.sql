-- Supprimer les transactions mockées de test
DELETE FROM transactions 
WHERE reference IN ('TRF-2025-11-001', 'CASH-2025-11-001', 'MM-2025-11-002', 'MM-2025-11-001')
OR (type = 'transfer' AND description LIKE '%Transfert vers épargne%')
OR (type = 'withdrawal' AND description LIKE '%Retrait cash%')
OR (type = 'deposit' AND description LIKE '%Épargne mensuelle%')
OR (type = 'deposit' AND description LIKE '%Dépôt initial%');