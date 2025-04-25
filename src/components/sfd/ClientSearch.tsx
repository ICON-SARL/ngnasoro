
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { useClientByPhone } from '@/hooks/sfd/useClientByPhone';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export const ClientSearch: React.FC = () => {
  const [searchPhone, setSearchPhone] = useState('');
  const { client, isLoading, searchClient } = useClientByPhone();
  const [isAdding, setIsAdding] = useState(false);
  const { activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPhone.trim().length < 5) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez saisir un numéro de téléphone valide",
        variant: "destructive",
      });
      return;
    }

    searchClient(searchPhone);
  };

  const addClient = async () => {
    if (!client || !activeSfdId) return;
    
    setIsAdding(true);
    try {
      // Create a client record for this user
      const { data, error } = await supabase
        .from('sfd_clients')
        .insert({
          user_id: client.user_id,
          sfd_id: activeSfdId,
          full_name: client.full_name,
          email: client.email,
          phone: client.phone,
          status: 'active', // Auto-validated by SFD admin
          validated_by: "sfd_admin", // Could use actual admin ID
          validated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      // Create user_sfds relationship
      await supabase
        .from('user_sfds')
        .insert({
          user_id: client.user_id,
          sfd_id: activeSfdId,
          is_default: true // Make this SFD the default for the user
        });
        
      // Try to create an account if needed
      try {
        await supabase
          .from('accounts')
          .insert({
            user_id: client.user_id,
            sfd_id: activeSfdId,
            balance: 0,
            currency: 'FCFA'
          });
      } catch (accountError) {
        console.error("Error creating account, but proceeding:", accountError);
      }

      toast({
        title: "Client ajouté",
        description: `${client.full_name} a été ajouté avec succès à votre SFD`,
      });

      // Reset form
      setSearchPhone('');
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });
      
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du client",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un client existant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher par numéro de téléphone"
                className="pl-8"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Rechercher
            </Button>
          </form>

          {client && client.isNewClient && (
            <div className="mt-4 p-4 border rounded-md bg-slate-50">
              <h3 className="font-medium text-sm">Utilisateur trouvé</h3>
              <p className="text-sm">{client.full_name}</p>
              <p className="text-xs text-muted-foreground">{client.email || 'No email'}</p>
              <p className="text-xs text-muted-foreground">{client.phone}</p>

              <Button 
                onClick={addClient} 
                className="mt-3 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                disabled={isAdding}
              >
                {isAdding ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ajout en cours...</>
                ) : (
                  <><UserPlus className="mr-2 h-4 w-4" /> Ajouter comme client</>
                )}
              </Button>
            </div>
          )}

          {client && !client.isNewClient && (
            <div className="mt-4 p-4 border rounded-md bg-orange-50">
              <p className="text-amber-800">Ce client est déjà associé à votre SFD.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
