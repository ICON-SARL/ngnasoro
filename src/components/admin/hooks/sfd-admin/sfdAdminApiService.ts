
import { api } from '@/lib/api';

// Type definitions for SFD Admin
export interface SfdAdmin {
  id: string;
  full_name: string;
  email: string;
  role: string;
  sfd_id: string;
  created_at: string;
  last_sign_in_at: string;
  has_2fa: boolean;
}

// Fetch all SFD admins
export async function fetchSfdAdmins(): Promise<SfdAdmin[]> {
  const response = await api.get('/sfd-admins');
  return response.data;
}

// Create a new SFD admin
export async function createSfdAdmin(data: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  sfd_id: string;
  notify: boolean;
}): Promise<SfdAdmin> {
  const response = await api.post('/sfd-admins', data);
  return response.data;
}

// Delete a SFD admin
export async function deleteSfdAdmin(adminId: string): Promise<void> {
  await api.delete(`/sfd-admins/${adminId}`);
}
