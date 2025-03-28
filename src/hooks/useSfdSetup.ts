
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

export function useSfdSetup() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, activeSfdId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createSfd = async (sfdData: {
    name: string;
    code: string;
    region: string;
    logo_url?: string;
  }) => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer une SFD",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);

    try {
      // Step 1: Create the SFD
      const { data: sfdData, error: sfdError } = await supabase
        .from('sfds')
        .insert({
          name: sfdData.name,
          code: sfdData.code,
          region: sfdData.region,
          logo_url: sfdData.logo_url,
          status: 'active'
        })
        .select()
        .single();

      if (sfdError) throw sfdError;

      // Step 2: Assign the SFD to the current user
      const { error: assignError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: user.id,
          sfd_id: sfdData.id,
          is_default: true
        });

      if (assignError) throw assignError;

      // Step 3: Create a default admin user for the SFD if needed
      const adminEmail = `admin-${sfdData.code.toLowerCase()}@ngnasoro.ml`;
      const adminPassword = 'SFDAdmin123!'; // Temporary password, should be changed on first login
      
      // Check if admin already exists
      const { data: existingUsers, error: userCheckError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', adminEmail);
        
      if (userCheckError) throw userCheckError;
      
      if (!existingUsers || existingUsers.length === 0) {
        // Create admin user in auth
        const { data: authData, error: authError } = await supabase.functions.invoke('create-sfd-admin', {
          body: {
            email: adminEmail,
            password: adminPassword,
            full_name: `Admin ${sfdData.name}`,
            sfdId: sfdData.id
          }
        });
        
        if (authError) {
          console.error('Error creating SFD admin:', authError);
        }
      }

      toast({
        title: "SFD créée avec succès",
        description: `La SFD ${sfdData.name} a été créée et configurée`,
        variant: "default",
      });

      return sfdData;
    } catch (error: any) {
      console.error('Error creating SFD:', error);
      toast({
        title: "Erreur lors de la création",
        description: error.message || "Une erreur est survenue lors de la création de la SFD",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createSfd
  };
}
