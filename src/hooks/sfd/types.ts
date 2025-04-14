
export interface SfdSubsidy {
  id: string;
  sfd_id: string;
  amount: number;
  used_amount: number;
  remaining_amount: number;
  status: 'active' | 'revoked' | 'depleted';
  created_at: string;
  allocated_by: string;
  allocated_at: string;  // Ensure this property is defined
  end_date?: string;
  description?: string;
}
