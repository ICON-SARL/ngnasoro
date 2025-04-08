
import { User } from "@supabase/supabase-js";

export type MerefLoanRequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'document_verification' 
  | 'credit_analysis' 
  | 'approved_internal' 
  | 'rejected_internal'
  | 'meref_submitted'
  | 'meref_approved'
  | 'meref_rejected'
  | 'meref_pending_info';

export type DocumentType = 
  | 'identity_card' 
  | 'payslip' 
  | 'bank_statement'
  | 'guarantees'
  | 'business_plan'
  | 'proof_of_address'
  | 'tax_certificate'
  | 'other';

export interface LoanDocument {
  id?: string;
  document_type: DocumentType;
  document_url: string;
  filename: string;
  uploaded_at?: Date;
  verified?: boolean;
}

export interface MerefLoanRequest {
  id?: string;
  sfd_id: string;
  client_id: string;
  loan_id?: string;
  amount: number;
  duration_months: number;
  purpose: string;
  guarantees?: string;
  monthly_income?: number;
  status: MerefLoanRequestStatus;
  meref_status?: string;
  meref_feedback?: string;
  meref_reference?: string;
  rejection_reason?: string;
  risk_score?: number;
  documents?: LoanDocument[];
  created_by: string;
  created_at?: Date;
  submitted_at?: Date;
  updated_at?: Date;
  approved_at?: Date;
  approved_by?: string;
  meref_submitted_at?: Date;
  meref_decided_at?: Date;
}

export interface MerefRequestActivity {
  id?: string;
  request_id: string;
  activity_type: string;
  description: string;
  details?: Record<string, any>;
  performed_by?: string;
  performed_at?: Date;
}

export interface MerefSettings {
  id?: string;
  api_endpoint?: string;
  api_key?: string;
  webhook_secret?: string;
  max_loan_amount: number;
  max_loan_duration: number;
  min_credit_score: number;
  debt_income_ratio_max: number;
  updated_by?: string;
  updated_at?: Date;
}
