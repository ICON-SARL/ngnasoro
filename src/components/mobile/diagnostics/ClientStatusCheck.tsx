
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ClientRecord {
  id: string;
  sfd_id: string;
  sfd_name?: string;
  status: string;
}

const ClientStatusCheck: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [clientRecords, setClientRecords] = useState<ClientRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const checkClientStatus = async () => {
    if (!user) {
      setErrorMessage("Vous devez être connecté pour vérifier votre statut");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Get all client records for this user
      const { data: clientsData, error: clientsError } = await supabase
        .from('sfd_clients')
        .select(`
          id, 
          status, 
          sfd_id,
          sfds:sfd_id (name)
        `)
        .eq('user_id', user.id);
        
      if (clientsError) {
        throw new Error(`Erreur lors de la vérification: ${clientsError.message}`);
      }
      
      if (!clientsData || clientsData.length === 0) {
        setErrorMessage("Vous n'êtes pas encore enregistré comme client dans aucune SFD");
        setClientRecords([]);
      } else {
        setClientRecords(clientsData.map(client => ({
          id: client.id,
          sfd_id: client.sfd_id,
          sfd_name: client.sfds?.name || 'SFD Inconnue',
          status: client.status
        })));
      }
    } catch (error: any) {
      console.error('Error checking client status:', error);
      setErrorMessage(error.message || "Une erreur est survenue lors de la vérification");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="border shadow">
      <CardHeader>
        <CardTitle>Vérification du statut client</CardTitle>
        <CardDescription>
          Vérifiez si vous êtes enregistré comme client dans une SFD
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {clientRecords.length > 0 && (
          <div className="space-y-4">
            <p className="font-medium">Vos enregistrements clients:</p>
            {clientRecords.map((record) => (
              <div 
                key={record.id} 
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{record.sfd_name}</p>
                  <p className="text-sm text-gray-500">ID: {record.id}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  record.status === 'validated' ? 'bg-green-100 text-green-800' :
                  record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.status === 'validated' ? 'Validé' :
                   record.status === 'pending' ? 'En attente' :
                   record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={checkClientStatus}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Vérification en cours...
            </span>
          ) : (
            "Vérifier mon statut"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClientStatusCheck;
