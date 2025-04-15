
import React from 'react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailableSfdCard } from '@/components/mobile/sfd-accounts/AvailableSfdCard';
import { Loader2 } from 'lucide-react';

export default function SfdConnectionPage() {
  const { data: sfds, isLoading } = useQuery({
    queryKey: ['active-sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'active')
        .order('name');
        
      if (error) throw error;
      return data;
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
        ) : sfds?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              Aucune SFD active n'est disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sfds?.map(sfd => (
              <AvailableSfdCard key={sfd.id} sfd={sfd} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
