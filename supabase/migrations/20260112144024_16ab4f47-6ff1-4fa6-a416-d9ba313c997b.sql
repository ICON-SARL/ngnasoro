-- Add new columns to collaborative_vaults for interest and closure
ALTER TABLE public.collaborative_vaults 
ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS close_reason TEXT;

-- Add interest tracking columns to collaborative_vault_members
ALTER TABLE public.collaborative_vault_members
ADD COLUMN IF NOT EXISTS interest_earned NUMERIC(14,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_interest_calculation TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add 'interest' to vault_transaction_type enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'interest' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'vault_transaction_type')
  ) THEN
    ALTER TYPE vault_transaction_type ADD VALUE 'interest';
  END IF;
END$$;