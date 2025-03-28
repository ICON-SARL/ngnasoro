
import { supabase } from '@/integrations/supabase/client';

export interface CreateAdminUserParams {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'sfd_admin' | 'user';
}

export const createAdminUser = async (params: CreateAdminUserParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: JSON.stringify(params)
    });

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur admin:", error);
    return { data: null, error: error.message };
  }
};
