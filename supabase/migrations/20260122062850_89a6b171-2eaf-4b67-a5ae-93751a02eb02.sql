-- =====================================================
-- MIGRATION: Corriger les vues Security Definer
-- =====================================================

-- 1. Recréer sfds_public avec SECURITY INVOKER explicite
DROP VIEW IF EXISTS sfds_public;
CREATE VIEW sfds_public 
WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  code,
  region,
  logo_url,
  status,
  created_at
FROM sfds
WHERE status = 'active';

GRANT SELECT ON sfds_public TO anon, authenticated;

-- 2. Recréer meref_loan_traceability avec SECURITY INVOKER explicite
DROP VIEW IF EXISTS meref_loan_traceability;
CREATE VIEW meref_loan_traceability 
WITH (security_invoker = on) AS
SELECT 
  msl.id AS meref_loan_id,
  msl.reference AS meref_reference,
  msl.amount AS meref_amount,
  msl.remaining_amount AS meref_remaining,
  msl.status AS meref_status,
  msl.created_at AS meref_created_at,
  s.id AS sfd_id,
  s.name AS sfd_name,
  s.code AS sfd_code,
  sl.id AS client_loan_id,
  sl.amount AS client_loan_amount,
  sl.remaining_amount AS client_remaining,
  sl.status AS client_loan_status,
  sc.id AS client_id,
  sc.full_name AS client_name,
  sc.phone AS client_phone
FROM meref_sfd_loans msl
JOIN sfds s ON msl.sfd_id = s.id
LEFT JOIN sfd_loans sl ON sl.meref_source_loan_id = msl.id
LEFT JOIN sfd_clients sc ON sl.client_id = sc.id;

-- Accès limité aux admins MEREF uniquement
GRANT SELECT ON meref_loan_traceability TO authenticated;