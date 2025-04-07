
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DemoAccountsCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createDemoAccounts = async () => {
    setIsCreating(true);
    
    try {
      // Créer un compte client
      const { error: clientError } = await supabase.auth.signUp({
        email: 'client@example.com',
        password: 'password123',
        options: {
          data: {
            role: 'client',
            full_name: 'Jean Durand'
          }
        }
      });

      if (clientError) throw new Error(`Erreur lors de la création du compte client: ${clientError.message}`);

      // Créer un compte admin SFD
      const { error: sfdAdminError } = await supabase.auth.signUp({
        email: 'sfd@example.com',
        password: 'password123',
        options: {
          data: {
            role: 'sfd_admin',
            full_name: 'Marie Koné',
            sfd_id: 'sfd_1'
          }
        }
      });

      if (sfdAdminError) throw new Error(`Erreur lors de la création du compte SFD: ${sfdAdminError.message}`);

      // Créer un compte super admin
      const { error: adminError } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'password123',
        options: {
          data: {
            role: 'admin',
            full_name: 'Amadou Diallo'
          }
        }
      });

      if (adminError) throw new Error(`Erreur lors de la création du compte admin: ${adminError.message}`);

      // Afficher un message de succès
      toast({
        title: "Comptes de démonstration créés",
        description: "Vous pouvez maintenant vous connecter avec les identifiants suivants:\n\nClient: client@example.com / password123\nSFD: sfd@example.com / password123\nAdmin: admin@example.com / password123",
        duration: 10000
      });

    } catch (error) {
      console.error('Erreur lors de la création des comptes:', error);
      toast({
        title: "Erreur de création des comptes",
        description: error.message || "Une erreur s'est produite lors de la création des comptes de démonstration.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 border-t text-center">
      <p className="text-sm text-gray-500 mb-2">Vous avez besoin de comptes pour tester?</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={createDemoAccounts}
        disabled={isCreating}
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Création en cours...
          </>
        ) : (
          'Créer des comptes de démonstration'
        )}
      </Button>
      {!isCreating && (
        <div className="mt-2 text-xs text-gray-400">
          <p>Client: client@example.com / password123</p>
          <p>SFD: sfd@example.com / password123</p>
          <p>Admin: admin@example.com / password123</p>
        </div>
      )}
    </div>
  );
};

export default DemoAccountsCreator;
