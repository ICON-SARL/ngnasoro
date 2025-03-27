
export type Sfd = {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  created_at: string;
  status?: 'active' | 'suspended' | 'pending';
};
