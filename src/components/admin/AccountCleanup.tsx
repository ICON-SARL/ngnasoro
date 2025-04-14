
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const AccountCleanup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCleanup = async () => {
    // Confirm before proceeding
    const confirmed = window.confirm(
      "ATTENTION: Cette action va supprimer tous les comptes sauf carriere@icon-sarl.com, admin@test.com et client@test.com. Cette action est irréversible. Voulez-vous continuer?"
    );
    
    if (!confirmed) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-test-accounts');
      
      if (error) {
        throw new Error(`Error calling function: ${error.message}`);
      }
      
      console.log('Account cleanup results:', data);
      setResults(data);
      
      toast({
        title: "Nettoyage terminé",
        description: `${data.results?.deleted || 0} comptes ont été supprimés avec succès.`,
      });
    } catch (err) {
      console.error('Error during account cleanup:', err);
      setError(err.message || "Une erreur s'est produite lors du nettoyage des comptes");
      
      toast({
        title: "Erreur",
        description: "Le nettoyage des comptes a échoué. Voir les détails pour plus d'informations.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-red-200">
      <CardHeader className="bg-red-50 rounded-t-lg border-b border-red-200">
        <CardTitle className="text-red-800 flex items-center">
          <ShieldAlert className="h-5 w-5 mr-2 text-red-600" />
          Nettoyage des comptes
        </CardTitle>
        <CardDescription className="text-red-700">
          Supprime tous les comptes utilisateurs et administrateurs sauf trois comptes spécifiques.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-4 text-sm">
          <p className="font-medium mb-2">Cette action va préserver uniquement les comptes suivants :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>carriere@icon-sarl.com</li>
            <li>admin@test.com</li>
            <li>client@test.com</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              Cette action est irréversible et supprimera tous les autres comptes utilisateurs et administrateurs.
            </AlertDescription>
          </Alert>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {results && (
          <div className="mb-4 border p-4 rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Résultats du nettoyage :</h3>
            <ul className="space-y-1 text-sm">
              <li><span className="font-medium">Total des comptes :</span> {results.results?.total || 0}</li>
              <li><span className="font-medium">Comptes préservés :</span> {results.results?.preserved || 0}</li>
              <li><span className="font-medium">Comptes supprimés :</span> {results.results?.deleted || 0}</li>
              <li><span className="font-medium">Erreurs :</span> {results.results?.errors || 0}</li>
            </ul>
          </div>
        )}
        
        <Button 
          variant="destructive"
          onClick={handleCleanup}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Suppression en cours...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Nettoyer les comptes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountCleanup;
