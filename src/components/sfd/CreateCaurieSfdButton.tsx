
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function CreateCaurieSfdButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateCaurieSfd = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-caurie-sfd');
      
      if (error) {
        throw new Error(error.message || 'Failed to create CAURIE-MF SFD');
      }
      
      setResult(data);
      toast({
        title: "Création réussie",
        description: "Le compte administrateur CAURIE-MF a été configuré avec succès.",
      });
    } catch (err: any) {
      console.error('Error creating CAURIE-MF SFD:', err);
      setError(err.message || 'Une erreur est survenue lors de la création');
      toast({
        title: "Erreur",
        description: err.message || "Échec de la création de l'accès CAURIE-MF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleCreateCaurieSfd} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Configuration en cours...
          </>
        ) : (
          'Créer l\'accès admin CAURIE-MF'
        )}
      </Button>
      
      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-700">Configuration réussie!</h3>
                <p className="text-sm mt-1">Voici les informations d'accès:</p>
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                  <div><strong>SFD:</strong> {result.sfd.name} ({result.sfd.code})</div>
                  <div className="mt-1"><strong>Email:</strong> {result.admin.email}</div>
                  <div><strong>Mot de passe:</strong> {result.admin.password}</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Vous pouvez utiliser ces identifiants pour vous connecter sur la page d'authentification SFD.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-700">Erreur de configuration</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-2">
        <p>Cette action va créer ou configurer:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>La SFD CAURIE-MF dans le système</li>
          <li>Un compte administrateur avec le rôle SFD Admin</li>
          <li>L'association entre l'utilisateur et la SFD</li>
        </ul>
      </div>
    </div>
  );
}
