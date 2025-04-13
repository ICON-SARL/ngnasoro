
import { supabase } from '@/integrations/supabase/client';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

export interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  role: string;
  sfd_id: string;
  sfd_name?: string;
  created_at?: string;
  last_sign_in_at?: string | null;
  status?: string;
}

/**
 * Get all SFD admins
 */
export async function getSfdAdmins(): Promise<SfdAdmin[]> {
  try {
    const response = await edgeFunctionApi.callEdgeFunction('fetch-sfd-admins');
    
    if (response?.error) {
      throw new Error(response.error);
    }
    
    return response?.admins || [];
  } catch (error: any) {
    console.error('Error fetching SFD admins:', error);
    throw new Error(error.message || 'Failed to fetch SFD admins');
  }
}

/**
 * Get SFD admins for a specific SFD
 */
export async function getSfdAdminsForSfd(sfdId: string): Promise<SfdAdmin[]> {
  try {
    const response = await edgeFunctionApi.callEdgeFunction('fetch-sfd-admins', { sfdId });
    
    if (response?.error) {
      throw new Error(response.error);
    }
    
    return response?.admins || [];
  } catch (error: any) {
    console.error(`Error fetching SFD admins for SFD ${sfdId}:`, error);
    throw new Error(error.message || 'Failed to fetch SFD admins');
  }
}

/**
 * Add a new SFD admin
 */
export async function addSfdAdmin(adminData: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  sfd_id: string;
  notify: boolean;
}): Promise<SfdAdmin> {
  try {
    console.log('Creating SFD admin with data:', { ...adminData, password: '***' });
    
    const response = await edgeFunctionApi.callEdgeFunction('create-sfd-admin', { adminData });
    
    if (response?.error) {
      throw new Error(response.error);
    }
    
    if (!response?.success) {
      throw new Error('Failed to create SFD admin');
    }
    
    return response.admin;
  } catch (error: any) {
    console.error('Error creating SFD admin:', error);
    throw new Error(error.message || 'Failed to create SFD admin');
  }
}

/**
 * Delete an SFD admin
 */
export async function deleteSfdAdmin(adminId: string): Promise<void> {
  try {
    const response = await edgeFunctionApi.callEdgeFunction('delete-sfd-admin', { adminId });
    
    if (response?.error) {
      throw new Error(response.error);
    }
    
    if (!response?.success) {
      throw new Error('Failed to delete SFD admin');
    }
  } catch (error: any) {
    console.error('Error deleting SFD admin:', error);
    throw new Error(error.message || 'Failed to delete SFD admin');
  }
}
