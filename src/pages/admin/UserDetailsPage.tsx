
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { UserDetails } from '@/components/admin/UserDetails';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function UserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        
        if (error) throw error;
        
        setUserData(data.user);
      } catch (error) {
        console.error('Error fetching user details:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de l'utilisateur.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [userId, toast]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Détails de l'Utilisateur</h1>
          <p className="text-muted-foreground">
            Informations et paramètres de l'utilisateur
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <UserDetails 
              userId={userId || ''} 
              userData={userData} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
