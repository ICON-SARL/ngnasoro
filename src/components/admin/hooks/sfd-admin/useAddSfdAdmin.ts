
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAddSfdAdmin() {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const addSfdAdmin = async (adminData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify?: boolean;
  }) => {
    setIsAdding(true);
    setError(null);
    
    try {
      // Appeler l'Edge Function pour créer l'administrateur SFD
      const { data, error: fnError } = await supabase.functions.invoke('create-sfd-admin', {
        body: JSON.stringify({ adminData })
      });
      
      if (fnError) {
        console.error('Erreur lors de la création de l\'administrateur:', fnError);
        throw new Error(fnError.message || "Erreur lors de la création de l'administrateur");
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data;
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'administrateur:', err);
      setError(err.message || "Une erreur est survenue lors de la création de l'administrateur");
      throw err;
    } finally {
      setIsAdding(false);
    }
  };
  
  return {
    addSfdAdmin,
    isAdding,
    error
  };
}
