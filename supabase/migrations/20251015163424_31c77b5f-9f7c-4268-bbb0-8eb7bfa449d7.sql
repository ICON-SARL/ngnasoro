-- ============================================
-- PHASE 1: INFRASTRUCTURE BASE DE DONNÉES
-- ============================================

-- 1.1 CRÉATION DES ENUMs
CREATE TYPE public.app_role AS ENUM ('admin', 'sfd_admin', 'client', 'user');
CREATE TYPE public.sfd_status AS ENUM ('active', 'suspended', 'pending', 'inactive');
CREATE TYPE public.transaction_status AS ENUM ('completed', 'pending', 'failed', 'cancelled');
CREATE TYPE public.account_status AS ENUM ('active', 'inactive', 'frozen', 'closed');
CREATE TYPE public.loan_status AS ENUM ('pending', 'approved', 'active', 'completed', 'defaulted', 'rejected');
CREATE TYPE public.document_type AS ENUM ('identity', 'proof_of_address', 'bank_statement', 'other');
CREATE TYPE public.payment_method AS ENUM ('cash', 'bank_transfer', 'mobile_money', 'check');

-- 1.2 TABLES PRINCIPALES

-- A. AUTHENTIFICATION & PROFILS
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL,
  has_2fa BOOLEAN DEFAULT false,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- B. ORGANISATIONS (SFD)
CREATE TABLE public.sfds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  region TEXT,
  status sfd_status DEFAULT 'pending',
  logo_url TEXT,
  contact_email TEXT,
  phone TEXT,
  description TEXT,
  address TEXT,
  legal_document_url TEXT,
  subsidy_balance DECIMAL(15,2) DEFAULT 0,
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sfds ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_sfds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, sfd_id)
);

ALTER TABLE public.user_sfds ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sfd_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('operation', 'remboursement', 'epargne')),
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'FCFA',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (sfd_id, account_type)
);

ALTER TABLE public.sfd_accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sfd_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_clients INTEGER DEFAULT 0,
  total_loans INTEGER DEFAULT 0,
  total_disbursed DECIMAL(15,2) DEFAULT 0,
  total_repaid DECIMAL(15,2) DEFAULT 0,
  active_loans INTEGER DEFAULT 0,
  defaulted_loans INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sfd_stats ENABLE ROW LEVEL SECURITY;

-- C. CLIENTS & COMPTES
CREATE TABLE public.sfd_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sfd_clients ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT DEFAULT 'FCFA',
  status account_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, sfd_id)
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.sfd_clients(id) ON DELETE CASCADE NOT NULL,
  document_type document_type NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.client_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.sfd_clients(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.client_activities ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.client_adhesion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.client_adhesion_requests ENABLE ROW LEVEL SECURITY;

-- D. TRANSACTIONS & PRÊTS
CREATE TABLE public.transaction_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transaction_types ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  status transaction_status DEFAULT 'completed',
  payment_method payment_method,
  reference TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sfd_loan_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sfd_loan_plans ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sfd_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.sfd_clients(id) ON DELETE CASCADE NOT NULL,
  loan_plan_id UUID REFERENCES public.sfd_loan_plans(id),
  amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  monthly_payment DECIMAL(15,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  remaining_amount DECIMAL(15,2) NOT NULL,
  status loan_status DEFAULT 'pending',
  purpose TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  next_payment_date DATE,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sfd_loans ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.sfd_loans(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method payment_method NOT NULL,
  reference TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.loan_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.sfd_loans(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.loan_activities ENABLE ROW LEVEL SECURITY;

-- E. SUBVENTIONS & DEMANDES
CREATE TABLE public.sfd_subsidies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  description TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sfd_subsidies ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subsidy_alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL UNIQUE,
  low_threshold DECIMAL(15,2) DEFAULT 1000000,
  critical_threshold DECIMAL(15,2) DEFAULT 500000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subsidy_alert_thresholds ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subsidy_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  justification TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subsidy_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subsidy_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.subsidy_requests(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subsidy_activities ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subsidy_request_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.subsidy_requests(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subsidy_request_activities ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.meref_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meref_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.meref_loan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID REFERENCES public.sfds(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.sfd_clients(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meref_loan_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.meref_request_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.meref_loan_requests(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meref_request_activities ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.meref_request_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.meref_loan_requests(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.meref_request_documents ENABLE ROW LEVEL SECURITY;

-- F. NOTIFICATIONS & RÔLES ADMIN
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- G. MOBILE MONEY
CREATE TABLE public.mobile_money_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator TEXT NOT NULL,
  api_key TEXT,
  api_secret TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mobile_money_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.mobile_money_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.mobile_money_webhooks ENABLE ROW LEVEL SECURITY;

-- H. AUDIT & SÉCURITÉ
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1.3 FONCTION DE SÉCURITÉ CRITIQUE
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 1.4 RLS POLICIES

-- Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- User Roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- User 2FA
CREATE POLICY "Users can manage their own 2FA"
  ON public.user_2fa FOR ALL
  USING (auth.uid() = user_id);

-- Admin Users
CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage admin users"
  ON public.admin_users FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- SFDs
CREATE POLICY "Admins can manage SFDs"
  ON public.sfds FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SFD admins can view their SFD"
  ON public.sfds FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = sfds.id)
  );

CREATE POLICY "Users can view active SFDs"
  ON public.sfds FOR SELECT
  USING (status = 'active');

-- User SFDs
CREATE POLICY "Users can view their own SFD associations"
  ON public.user_sfds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user SFD associations"
  ON public.user_sfds FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- SFD Accounts
CREATE POLICY "Admins can manage SFD accounts"
  ON public.sfd_accounts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SFD admins can view their SFD accounts"
  ON public.sfd_accounts FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = sfd_accounts.sfd_id)
  );

-- SFD Stats
CREATE POLICY "Admins can manage SFD stats"
  ON public.sfd_stats FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SFD admins can view their stats"
  ON public.sfd_stats FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = sfd_stats.sfd_id)
  );

-- SFD Clients
CREATE POLICY "SFD admins can manage their clients"
  ON public.sfd_clients FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = sfd_clients.sfd_id)
  );

CREATE POLICY "Clients can view their own data"
  ON public.sfd_clients FOR SELECT
  USING (auth.uid() = user_id);

-- Accounts
CREATE POLICY "Users can view their own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "SFD admins can manage accounts in their SFD"
  ON public.accounts FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = accounts.sfd_id)
  );

-- Client Documents
CREATE POLICY "SFD admins can manage client documents"
  ON public.client_documents FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM public.sfd_clients sc
      JOIN public.user_sfds us ON us.sfd_id = sc.sfd_id
      WHERE sc.id = client_documents.client_id AND us.user_id = auth.uid()
    )
  );

-- Client Activities
CREATE POLICY "SFD admins can view client activities"
  ON public.client_activities FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM public.sfd_clients sc
      JOIN public.user_sfds us ON us.sfd_id = sc.sfd_id
      WHERE sc.id = client_activities.client_id AND us.user_id = auth.uid()
    )
  );

-- Client Adhesion Requests
CREATE POLICY "Users can view their own adhesion requests"
  ON public.client_adhesion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create adhesion requests"
  ON public.client_adhesion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "SFD admins can manage adhesion requests"
  ON public.client_adhesion_requests FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = client_adhesion_requests.sfd_id)
  );

-- Transaction Types
CREATE POLICY "Everyone can view transaction types"
  ON public.transaction_types FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage transaction types"
  ON public.transaction_types FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "SFD admins can manage transactions in their SFD"
  ON public.transactions FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = transactions.sfd_id)
  );

-- SFD Loan Plans
CREATE POLICY "Everyone can view active loan plans"
  ON public.sfd_loan_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "SFD admins can manage their loan plans"
  ON public.sfd_loan_plans FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = sfd_loan_plans.sfd_id)
  );

-- SFD Loans
CREATE POLICY "Clients can view their own loans"
  ON public.sfd_loans FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.sfd_clients WHERE id = sfd_loans.client_id AND user_id = auth.uid())
  );

CREATE POLICY "SFD admins can manage loans in their SFD"
  ON public.sfd_loans FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = sfd_loans.sfd_id)
  );

-- Loan Payments
CREATE POLICY "Clients can view their own loan payments"
  ON public.loan_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sfd_loans sl
      JOIN public.sfd_clients sc ON sc.id = sl.client_id
      WHERE sl.id = loan_payments.loan_id AND sc.user_id = auth.uid()
    )
  );

CREATE POLICY "SFD admins can manage loan payments"
  ON public.loan_payments FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM public.sfd_loans sl
      JOIN public.user_sfds us ON us.sfd_id = sl.sfd_id
      WHERE sl.id = loan_payments.loan_id AND us.user_id = auth.uid()
    )
  );

-- Loan Activities
CREATE POLICY "SFD admins can view loan activities"
  ON public.loan_activities FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM public.sfd_loans sl
      JOIN public.user_sfds us ON us.sfd_id = sl.sfd_id
      WHERE sl.id = loan_activities.loan_id AND us.user_id = auth.uid()
    )
  );

-- SFD Subsidies
CREATE POLICY "Admins can manage subsidies"
  ON public.sfd_subsidies FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SFD admins can view their subsidies"
  ON public.sfd_subsidies FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = sfd_subsidies.sfd_id)
  );

-- Subsidy Alert Thresholds
CREATE POLICY "Admins can manage subsidy thresholds"
  ON public.subsidy_alert_thresholds FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SFD admins can view their thresholds"
  ON public.subsidy_alert_thresholds FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = subsidy_alert_thresholds.sfd_id)
  );

-- Subsidy Requests
CREATE POLICY "SFD admins can create subsidy requests"
  ON public.subsidy_requests FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = subsidy_requests.sfd_id)
  );

CREATE POLICY "SFD admins can view their subsidy requests"
  ON public.subsidy_requests FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = subsidy_requests.sfd_id)
  );

CREATE POLICY "Admins can manage all subsidy requests"
  ON public.subsidy_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Subsidy Activities & Request Activities
CREATE POLICY "Users can view subsidy activities"
  ON public.subsidy_activities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage subsidy activities"
  ON public.subsidy_activities FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view subsidy request activities"
  ON public.subsidy_request_activities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage subsidy request activities"
  ON public.subsidy_request_activities FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- MEREF Settings
CREATE POLICY "Admins can manage MEREF settings"
  ON public.meref_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- MEREF Loan Requests
CREATE POLICY "SFD admins can create MEREF loan requests"
  ON public.meref_loan_requests FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = meref_loan_requests.sfd_id)
  );

CREATE POLICY "SFD admins can view their MEREF requests"
  ON public.meref_loan_requests FOR SELECT
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (SELECT 1 FROM public.user_sfds WHERE user_id = auth.uid() AND sfd_id = meref_loan_requests.sfd_id)
  );

CREATE POLICY "Admins can manage all MEREF requests"
  ON public.meref_loan_requests FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- MEREF Request Activities
CREATE POLICY "Users can view MEREF request activities"
  ON public.meref_request_activities FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage MEREF request activities"
  ON public.meref_request_activities FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- MEREF Request Documents
CREATE POLICY "SFD admins can manage their MEREF documents"
  ON public.meref_request_documents FOR ALL
  USING (
    public.has_role(auth.uid(), 'sfd_admin') AND
    EXISTS (
      SELECT 1 FROM public.meref_loan_requests mlr
      JOIN public.user_sfds us ON us.sfd_id = mlr.sfd_id
      WHERE mlr.id = meref_request_documents.request_id AND us.user_id = auth.uid()
    )
  );

-- Admin Notifications
CREATE POLICY "Users can view their own notifications"
  ON public.admin_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.admin_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin Roles
CREATE POLICY "Admins can manage admin roles"
  ON public.admin_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Mobile Money Settings
CREATE POLICY "Admins can manage mobile money settings"
  ON public.mobile_money_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Mobile Money Webhooks
CREATE POLICY "System can create webhooks"
  ON public.mobile_money_webhooks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view webhooks"
  ON public.mobile_money_webhooks FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Audit Logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- 1.5 TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_2fa_updated_at
  BEFORE UPDATE ON public.user_2fa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sfds_updated_at
  BEFORE UPDATE ON public.sfds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sfd_accounts_updated_at
  BEFORE UPDATE ON public.sfd_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sfd_stats_updated_at
  BEFORE UPDATE ON public.sfd_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sfd_clients_updated_at
  BEFORE UPDATE ON public.sfd_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sfd_loans_updated_at
  BEFORE UPDATE ON public.sfd_loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subsidy_alert_thresholds_updated_at
  BEFORE UPDATE ON public.subsidy_alert_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meref_settings_updated_at
  BEFORE UPDATE ON public.meref_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mobile_money_settings_updated_at
  BEFORE UPDATE ON public.mobile_money_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 1.6 INDEX POUR PERFORMANCE
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_user_sfds_user_sfd ON user_sfds(user_id, sfd_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_sfd_date ON transactions(sfd_id, created_at DESC);
CREATE INDEX idx_accounts_user_sfd ON accounts(user_id, sfd_id);
CREATE INDEX idx_sfd_loans_status ON sfd_loans(status, created_at DESC);
CREATE INDEX idx_sfd_loans_client ON sfd_loans(client_id);
CREATE INDEX idx_sfd_loans_sfd ON sfd_loans(sfd_id);
CREATE INDEX idx_audit_logs_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_category ON audit_logs(category, created_at DESC);