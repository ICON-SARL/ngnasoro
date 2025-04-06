
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ClientDetails from '@/components/sfd/ClientDetails';
import { AgencyHeader } from '@/components/AgencyHeader';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { SfdClient } from '@/types/sfdClients';

const ClientDetailsPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { user } = useAuth();
  const [client, setClient] = useState<SfdClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (error) throw error;
        setClient(data);
      } catch (error) {
        console.error('Error fetching client:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClient();
  }, [clientId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Détails du Client</h1>
          <p className="text-muted-foreground">Consultez les informations du client</p>
        </div>
        
        {isLoading ? (
          <Card>
            <CardContent className="py-6">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-5 w-48" />
                  
                  <Skeleton className="h-4 w-24 mt-4 mb-2" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-36 mb-2" />
                  <Skeleton className="h-5 w-40" />
                  
                  <Skeleton className="h-4 w-28 mt-4 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : client ? (
          <ClientDetails client={client} />
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-lg text-gray-500">Client introuvable</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientDetailsPage;
