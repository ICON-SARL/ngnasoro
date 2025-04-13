
export type SfdAccountType = 'operation' | 'remboursement' | 'epargne';

export interface SfdAccount {
  id: string;
  sfd_id: string;
  account_type: SfdAccountType;
  description: string | null;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SfdAccountTransfer {
  id: string;
  sfd_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string | null;
  performed_by: string | null;
  created_at: string;
}

export interface CreateTransferParams {
  sfdId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}
