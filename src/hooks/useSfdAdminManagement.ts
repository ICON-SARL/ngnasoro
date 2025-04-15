
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SfdAdmin {
  id: string;
  email: string;
  full_name: string;
  sfd_id: string;
  role: string;
}

export function useSfdAdminManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addSfdAdmin = async ({
    email,
    password,
    full_name,
    role,
    sfd_id,
    notify = true
  }: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify?: boolean;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('create-sfd-admin', {
        body: JSON.stringify({
          adminData: {
            email,
            password,
            full_name,
            role,
            sfd_id,
            notify
          }
        })
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Administrateur créé',
        description: `${full_name} a été ajouté comme administrateur SFD`
      });

      return data;
    } catch (err: any) {
      console.error('Error creating SFD admin:', err);
      setError(err.message);
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    addSfdAdmin
  };
}
