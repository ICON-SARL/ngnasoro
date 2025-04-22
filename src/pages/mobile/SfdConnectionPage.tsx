
import React from 'react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailableSfdCard } from '@/components/mobile/sfd-accounts/AvailableSfdCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sfd } from '@/types/sfd-types';

export default function SfdConnectionPage() {
  const navigate = useNavigate();
  
  const { data: sfds, isLoading, error, refetch } = useQuery({
    queryKey: ['active-sfds'],
    queryFn: async () => {
      try {
        console.log('Fetching active SFDs from database...');
        // First try direct database query
        const { data: directData, error: directError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active')
          .order('name');
          
        if (directError) {
          console.error('Error fetching SFDs:', directError);
          throw directError;
        }
        
        if (directData && directData.length > 0) {
          console.log(`Found ${directData.length} active SFDs`);
          return directData as Sfd[];
        }
        
        console.log('No active SFDs found');
        // Return empty array if no SFDs found
        return [] as Sfd[];
      } catch (error) {
        console.error('Failed to fetch SFDs:', error);
        throw error;
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Choisir une SFD</h1>
          <p className="text-muted-foreground">
            Sélectionnez une institution de microfinance pour commencer
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-lg text-red-700 mb-2">Erreur lors du chargement des SFDs</p>
            <p className="text-sm text-red-600 mb-4">Veuillez réessayer plus tard</p>
            <Button onClick={() => refetch()} variant="outline" className="mr-2">
              Réessayer
            </Button>
            <Button onClick={() => navigate(-1)}>
              Retour
            </Button>
          </div>
        ) : !sfds || sfds.length === 0 ? (
          <div className="text-center py-12 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <p className="text-lg text-amber-800 mb-2">
              Aucune SFD active n'est disponible pour le moment.
            </p>
            <p className="text-sm text-amber-700 mb-4">
              Veuillez contacter l'administrateur du système.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Rafraîchir
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sfds.map(sfd => (
              <AvailableSfdCard key={sfd.id} sfd={sfd} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
