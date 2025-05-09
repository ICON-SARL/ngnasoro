import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DemoAccountsCreator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const { toast } = useToast();

  const createTestAccounts = async () => {
    setIsLoading(true);
    setResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-test-accounts');
      
      if (error) {
        throw error;
      }
      
      setResults(data.results);
      console.log('Test accounts creation response:', data);
      
      toast({
        title: 'Comptes de test créés',
        description: 'Les comptes de démonstration ont été configurés avec succès.',
      });
    } catch (error) {
      console.error('Failed to create test accounts:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer les comptes de test. Vérifiez la console pour plus de détails.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDetails = (result: any) => {
    if (result.status === 'created') {
      return `Créé avec le rôle: ${result.role}`;
    } else if (result.status === 'already_exists') {
      return result.hasCorrectRole 
        ? `Existant avec le rôle: ${result.role}` 
        : `Existant, rôle mis à jour: ${result.role}`;
    } else {
      return `Erreur: ${result.message || 'Inconnue'}`;
    }
  };

  const getStatusIcon = (result: any) => {
    if (result.status === 'created') {
      return <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />;
    } else if (result.status === 'already_exists') {
      return result.hasCorrectRole 
        ? <CheckCircle2 className="h-3 w-3 text-blue-500 mr-1" />
        : <Info className="h-3 w-3 text-orange-500 mr-1" />;
    } else {
      return <AlertCircle className="h-3 w-3 text-red-500 mr-1" />;
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-sm font-medium mb-2">Comptes de démonstration</h3>
      
      <div className="mb-2 text-xs text-gray-500">
        <p>Créer des comptes de test avec les identifiants suivants:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Client: client@test.com / password123</li>
          <li>SFD Admin 1: sfd@test.com / password123</li>
          <li>SFD Admin 2: sfd2@test.com / password123</li>
          <li>MEREF Admin: admin@test.com / password123</li>
        </ul>
      </div>
      
      <Button 
        onClick={createTestAccounts} 
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Création en cours...
          </>
        ) : (
          'Créer les comptes de test'
        )}
      </Button>
      
      {results && (
        <div className="mt-3 text-xs">
          <p className="font-medium">Résultats:</p>
          <ul className="space-y-1 mt-1">
            {results.map((result, idx) => (
              <li key={idx} className="flex items-center">
                {getStatusIcon(result)}
                <span>
                  {result.email}: {getStatusDetails(result)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DemoAccountsCreator;
