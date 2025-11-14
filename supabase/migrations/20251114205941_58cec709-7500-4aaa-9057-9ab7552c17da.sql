-- Configuration pg_cron pour workflows automatiques
-- Activer pg_cron si pas encore fait
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Calcul des pénalités de retard (tous les jours à 2h du matin)
SELECT cron.schedule(
  'calculate-daily-loan-penalties',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hnzozzbnfougbcncdgrk.supabase.co/functions/v1/scheduled-tasks',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhuem96emJuZm91Z2JjbmNkZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDQzNTMsImV4cCI6MjA3NTA4MDM1M30.HYKXdd9oO2Mh4tz3OMaL89GONlcJNt_p2Hd9wqF6RYA"}'::jsonb,
    body := '{"task": "calculate_penalties"}'::jsonb
  ) as request_id;
  $$
);

-- Réconciliation Mobile Money (toutes les heures)
SELECT cron.schedule(
  'auto-reconcile-mobile-money',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://hnzozzbnfougbcncdgrk.supabase.co/functions/v1/scheduled-tasks',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhuem96emJuZm91Z2JjbmNkZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDQzNTMsImV4cCI6MjA3NTA4MDM1M30.HYKXdd9oO2Mh4tz3OMaL89GONlcJNt_p2Hd9wqF6RYA"}'::jsonb,
    body := '{"task": "auto_reconcile"}'::jsonb
  ) as request_id;
  $$
);

-- Mise à jour des statistiques SFD (toutes les 6 heures)
SELECT cron.schedule(
  'update-sfd-statistics',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hnzozzbnfougbcncdgrk.supabase.co/functions/v1/scheduled-tasks',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhuem96emJuZm91Z2JjbmNkZ3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDQzNTMsImV4cCI6MjA3NTA4MDM1M30.HYKXdd9oO2Mh4tz3OMaL89GONlcJNt_p2Hd9wqF6RYA"}'::jsonb,
    body := '{"task": "update_all_stats"}'::jsonb
  ) as request_id;
  $$
);

COMMENT ON EXTENSION pg_cron IS 'Tâches planifiées pour le système MEREF-SFD';