
-- Enable FULL replication identity for the accounts table to capture all changes
ALTER TABLE public.accounts
  REPLICA IDENTITY FULL;

-- Enable the realtime publication for the accounts table
ALTER PUBLICATION supabase_realtime
  ADD TABLE public.accounts;
