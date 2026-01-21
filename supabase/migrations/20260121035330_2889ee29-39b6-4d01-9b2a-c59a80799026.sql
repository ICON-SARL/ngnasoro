-- Add email column to profiles table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add reference_number column to client_adhesion_requests if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_adhesion_requests' AND column_name = 'reference_number') THEN
    ALTER TABLE client_adhesion_requests ADD COLUMN reference_number TEXT;
  END IF;
END $$;