-- Migration pour ajouter les fonctionnalités manquantes critiques

-- 1. Ajouter colonnes manquantes dans profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS client_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 1 CHECK (kyc_level BETWEEN 1 AND 3);

-- 2. Ajouter colonnes manquantes dans sfd_clients
ALTER TABLE public.sfd_clients 
ADD COLUMN IF NOT EXISTS client_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 1 CHECK (kyc_level BETWEEN 1 AND 3);

-- 3. Ajouter colonnes manquantes dans client_documents
ALTER TABLE public.client_documents 
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

-- 4. Ajouter colonnes manquantes dans client_activities
ALTER TABLE public.client_activities 
ADD COLUMN IF NOT EXISTS performed_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 5. Ajouter colonnes manquantes dans sfd_subsidies
ALTER TABLE public.sfd_subsidies 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS sponsor_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS used_amount NUMERIC DEFAULT 0;

-- 6. Créer table subsidy_usage pour tracer l'utilisation des subventions
CREATE TABLE IF NOT EXISTS public.subsidy_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subsidy_id UUID NOT NULL REFERENCES public.sfd_subsidies(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES public.sfd_loans(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

ALTER TABLE public.subsidy_usage ENABLE ROW LEVEL SECURITY;

-- 7. Ajouter colonnes manquantes dans audit_logs
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS target_resource TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS device_info JSONB;

-- 8. Ajouter colonnes manquantes dans subsidy_requests
ALTER TABLE public.subsidy_requests 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS alert_triggered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expected_impact TEXT;

-- 9. Ajouter colonnes manquantes dans subsidy_activities
ALTER TABLE public.subsidy_activities 
ADD COLUMN IF NOT EXISTS subsidy_id UUID REFERENCES public.sfd_subsidies(id) ON DELETE CASCADE;

-- 10. Créer table report_definitions pour les rapports
CREATE TABLE IF NOT EXISTS public.report_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  schema JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.report_definitions ENABLE ROW LEVEL SECURITY;

-- 11. Créer table generated_reports pour stocker les rapports générés
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id UUID NOT NULL REFERENCES public.report_definitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parameters JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result_url TEXT,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'excel', 'csv', 'json')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT
);

ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Policies RLS pour subsidy_usage
CREATE POLICY "Admins can manage subsidy usage"
ON public.subsidy_usage
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "SFD admins can view their subsidy usage"
ON public.subsidy_usage
FOR SELECT
USING (
  has_role(auth.uid(), 'sfd_admin') 
  AND EXISTS (
    SELECT 1 FROM sfd_subsidies ss
    JOIN user_sfds us ON us.sfd_id = ss.sfd_id
    WHERE ss.id = subsidy_usage.subsidy_id
    AND us.user_id = auth.uid()
  )
);

-- Policies RLS pour report_definitions
CREATE POLICY "Admins can manage report definitions"
ON public.report_definitions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view report definitions"
ON public.report_definitions
FOR SELECT
USING (true);

-- Policies RLS pour generated_reports
CREATE POLICY "Users can view their own reports"
ON public.generated_reports
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
ON public.generated_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
ON public.generated_reports
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_subsidy_usage_subsidy_id ON public.subsidy_usage(subsidy_id);
CREATE INDEX IF NOT EXISTS idx_subsidy_usage_loan_id ON public.subsidy_usage(loan_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_user_id ON public.generated_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_status ON public.generated_reports(status);
CREATE INDEX IF NOT EXISTS idx_profiles_client_code ON public.profiles(client_code);
CREATE INDEX IF NOT EXISTS idx_sfd_clients_client_code ON public.sfd_clients(client_code);

-- Trigger pour mettre à jour used_amount dans sfd_subsidies
CREATE OR REPLACE FUNCTION update_subsidy_used_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sfd_subsidies 
    SET used_amount = COALESCE(used_amount, 0) + NEW.amount
    WHERE id = NEW.subsidy_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE sfd_subsidies 
    SET used_amount = COALESCE(used_amount, 0) - OLD.amount
    WHERE id = OLD.subsidy_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER subsidy_usage_update_amount
AFTER INSERT OR DELETE ON public.subsidy_usage
FOR EACH ROW EXECUTE FUNCTION update_subsidy_used_amount();

-- Fonction pour générer un code client unique
CREATE OR REPLACE FUNCTION generate_client_code(sfd_code TEXT)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  counter INTEGER := 1;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := sfd_code || '-' || LPAD(counter::TEXT, 6, '0');
    
    SELECT EXISTS(
      SELECT 1 FROM sfd_clients WHERE client_code = new_code
      UNION
      SELECT 1 FROM profiles WHERE client_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
    counter := counter + 1;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;