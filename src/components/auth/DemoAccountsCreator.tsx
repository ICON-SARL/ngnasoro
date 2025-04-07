
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface AccountResult {
  email: string;
  status: 'success' | 'error';
  role: string;
  hasCorrectRole: boolean;
  message?: string;
}

const DemoAccountsCreator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AccountResult[]>([]);

  const createAccounts = async () => {
    setIsLoading(true);
    setResults([]);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated results
      setResults([
        {
          email: 'admin@meref-mali.ml',
          status: 'success',
          role: 'super_admin',
          hasCorrectRole: true,
        },
        {
          email: 'sfd@example.com',
          status: 'success',
          role: 'sfd_admin',
          hasCorrectRole: true,
        },
        {
          email: 'client@example.com',
          status: 'success',
          role: 'client',
          hasCorrectRole: true,
        }
      ]);
    } catch (error) {
      console.error('Error creating demo accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full mt-4"
        onClick={() => setIsOpen(true)}
      >
        Créer des comptes de démo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comptes de démo</DialogTitle>
            <DialogDescription>
              Créez des comptes de test pour essayer l'application.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Création des comptes en cours...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Comptes créés avec succès:</p>
                <ul className="space-y-2">
                  {results.map((result, index) => (
                    <li key={index} className="text-sm border rounded-md p-3">
                      <p><strong>Email:</strong> {result.email}</p>
                      <p><strong>Rôle:</strong> {result.role}</p>
                      <p><strong>Mot de passe:</strong> password123</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Button 
                onClick={createAccounts}
                className="w-full"
              >
                Créer des comptes de test
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DemoAccountsCreator;
