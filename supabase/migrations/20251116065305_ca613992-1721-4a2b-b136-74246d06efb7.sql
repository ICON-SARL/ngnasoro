-- Créer les comptes manquants pour les SFDs
-- Cette migration crée automatiquement les 3 types de comptes (operation, remboursement, epargne)
-- pour tous les SFDs qui n'ont pas encore ces comptes

INSERT INTO sfd_accounts (sfd_id, account_type, balance, currency, status)
SELECT 
  sfds.id,
  account_type.type,
  0,
  'FCFA',
  'active'
FROM sfds
CROSS JOIN (
  VALUES 
    ('operation'),
    ('remboursement'),
    ('epargne')
) AS account_type(type)
WHERE NOT EXISTS (
  SELECT 1 
  FROM sfd_accounts 
  WHERE sfd_accounts.sfd_id = sfds.id 
  AND sfd_accounts.account_type = account_type.type
)
ON CONFLICT DO NOTHING;

-- Ajouter un log d'audit pour traçabilité
INSERT INTO audit_logs (
  action,
  category,
  severity,
  status,
  details,
  target_resource
)
VALUES (
  'create_missing_sfd_accounts',
  'system',
  'info',
  'success',
  jsonb_build_object(
    'description', 'Création automatique des comptes système manquants pour les SFDs',
    'account_types', ARRAY['operation', 'remboursement', 'epargne']
  ),
  'sfd_accounts'
);