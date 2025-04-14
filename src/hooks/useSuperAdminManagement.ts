
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_2fa: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
}

export interface AdminCreateData {
  email: string;
  full_name: string;
  password: string;
  role: string;
}

export function useSuperAdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const [loadAttempted, setLoadAttempted] = useState(false);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);
    setLoadAttempted(true);

    try {
      console.log('Fetching admin users using the functions API...');
      
      // Utiliser la fonction Edge pour récupérer les administrateurs
      const { data, error: funcError } = await supabase.functions.invoke('fetch-admin-users', {
        method: 'POST',
        body: JSON.stringify({ timestamp: Date.now() }), // Ajouter un timestamp pour éviter les caches
      });
      
      if (funcError) {
        throw new Error(`Error calling function: ${funcError.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from function');
      }
      
      // Mapper les données de l'API à notre interface AdminUser
      const mappedAdmins = data.map((admin: any) => ({
        ...admin,
        is_active: admin.is_active !== undefined ? admin.is_active : true
      }));
      
      setAdmins(mappedAdmins as AdminUser[]);
      console.log(`Successfully loaded ${mappedAdmins.length} admin users`);
      
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      setError(err.message || 'Failed to load administrators');
      
      // La gestion des données factices est maintenant déplacée dans la composante AdminUsersList
      // pour une meilleure séparation des préoccupations
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour créer un nouvel administrateur
  const createAdmin = async (adminData: AdminCreateData) => {
    setIsCreating(true);
    
    try {
      // Appel à la fonction Edge pour créer un administrateur
      const { data, error: createError } = await supabase.functions.invoke('create-admin-user', {
        method: 'POST',
        body: JSON.stringify(adminData)
      });
      
      if (createError) {
        throw new Error(`Erreur lors de la création: ${createError.message}`);
      }
      
      if (!data || !data.success) {
        throw new Error(data?.message || 'Échec de la création de l\'administrateur');
      }
      
      toast({
        title: "Succès",
        description: `L'administrateur ${adminData.full_name} a été créé avec succès`,
      });
      
      // Actualiser la liste des administrateurs
      fetchAdmins();
      
      return true;
    } catch (err: any) {
      console.error('Error creating admin:', err);
      
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la création de l'administrateur",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  // Fonction pour activer/désactiver un administrateur
  const toggleAdminStatus = async (adminId: string, active: boolean) => {
    try {
      // Cette fonction appellerait normalement une fonction Edge pour modifier le statut
      console.log(`Toggling admin status for ${adminId} to ${active ? 'active' : 'inactive'}`);
      
      // Pour l'instant, mettre à jour uniquement dans l'état local
      setAdmins(prevAdmins => 
        prevAdmins.map(admin => 
          admin.id === adminId 
            ? { ...admin, is_active: active }
            : admin
        )
      );
      
      toast({
        title: "Statut mis à jour",
        description: `L'administrateur est maintenant ${active ? 'actif' : 'inactif'}.`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error toggling admin status:', err);
      
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'administrateur.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Fonction pour réinitialiser le mot de passe d'un administrateur
  const resetAdminPassword = async (adminEmail: string) => {
    try {
      // Appeler la fonction de réinitialisation de mot de passe de Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(adminEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email envoyé",
        description: "Un email de réinitialisation du mot de passe a été envoyé.",
      });
      
      return true;
    } catch (err: any) {
      console.error('Error resetting admin password:', err);
      
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Définir un temps maximum de chargement (15 secondes)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      timer = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          if (!error) {
            setError("Le chargement a pris trop de temps. Veuillez réessayer.");
          }
        }
      }, 15000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, error]);

  useEffect(() => {
    if (!loadAttempted) {
      fetchAdmins();
    }
  }, [loadAttempted]);

  return {
    admins,
    isLoading,
    isCreating,
    error,
    refetchAdmins: fetchAdmins,
    createAdmin,
    toggleAdminStatus,
    resetAdminPassword
  };
}
