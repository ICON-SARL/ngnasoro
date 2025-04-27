import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { useSfdClientOperations } from '@/hooks/useSfdClientOperations';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClientCodeSearchField } from './ClientCodeSearchField';
import { Separator } from '@/components/ui/separator';
import { 
  UserPlus, 
  AlertTriangle,
  Check
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClientList } from './ClientList';
import { ClientLookupResult } from '@/utils/client-code/lookup';

// Client registration form schema
const clientSchema = z.object({
  full_name: z.string().min(3, { message: 'Le nom complet est requis' }),
  email: z.string().email({ message: 'Email invalide' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  id_number: z.string().optional().or(z.literal('')),
  id_type: z.string().optional().or(z.literal('')),
  profession: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof clientSchema>;

export const ClientManagementSystem = () => {
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);
  const [clientToRegister, setClientToRegister] = useState<ClientLookupResult | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { user, activeSfdId } = useAuth();
  
  const {
    clients,
    isLoading,
    isSearching,
    createClient
  } = useSfdClientOperations();

  // Client registration form
  const form = useForm<FormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: clientToRegister?.full_name || '',
      email: clientToRegister?.email || '',
      phone: clientToRegister?.phone || '',
      address: '',
      id_number: '',
      id_type: '',
      profession: '',
    }
  });
  
  // Reset form when clientToRegister changes
  React.useEffect(() => {
    if (clientToRegister) {
      form.reset({
        full_name: clientToRegister.full_name || '',
        email: clientToRegister.email || '',
        phone: clientToRegister.phone || '',
        address: '',
        id_number: '',
        id_type: '',
        profession: '',
      });
    } else {
      form.reset();
    }
  }, [clientToRegister, form]);

  const handleClientFound = (client: ClientLookupResult) => {
    console.log('Client found:', client);
    
    // If this is not a new client but an existing SFD client, don't allow registration
    if (client && !client.is_new_client && client.sfd_id === activeSfdId) {
      return;
    }
    
    setClientToRegister(client);
    setIsNewClientDialogOpen(true);
  };
  
  const onSubmit = async (data: FormValues) => {
    try {
      const clientData = {
        ...data,
        full_name: data.full_name, // Ensure full_name is required
        user_id: clientToRegister?.user_id,
        client_code: clientToRegister?.client_code,
      };
      
      await createClient.mutateAsync(clientData);
      setIsNewClientDialogOpen(false);
      setClientToRegister(null);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestion des Clients</CardTitle>
            <Button 
              onClick={() => {
                setClientToRegister(null);
                setIsNewClientDialogOpen(true);
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Nouveau Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-gray-50 border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">Rechercher un client par code</h3>
              <ClientCodeSearchField
                onClientFound={handleClientFound}
                isSearching={isSearching}
                onSearchComplete={(success) => {}}
              />
            </div>
            
            <Separator />
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all">Tous les clients</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="validated">Validés</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <ClientList
                  clients={clients}
                  isLoading={isLoading}
                  status="all"
                />
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-4">
                <ClientList
                  clients={clients.filter(client => client.status === 'pending')}
                  isLoading={isLoading}
                  status="pending"
                />
              </TabsContent>
              
              <TabsContent value="validated" className="space-y-4">
                <ClientList
                  clients={clients.filter(client => client.status === 'validated')}
                  isLoading={isLoading}
                  status="validated"
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialogue pour l'enregistrement d'un client */}
      <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {clientToRegister?.user_id ? 'Enregistrer un client existant' : 'Ajouter un nouveau client'}
            </DialogTitle>
            <DialogDescription>
              {clientToRegister?.user_id 
                ? 'Cet utilisateur a déjà un compte. Complétez les informations ci-dessous pour l\'ajouter comme client.'
                : 'Saisissez les informations du client pour créer son compte.'}
            </DialogDescription>
          </DialogHeader>
          
          {clientToRegister?.user_id && (
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Check className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">
                Utilisateur trouvé avec le code client: {clientToRegister.client_code}
              </AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom complet" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Email" type="email" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+223 XXXXXXXX" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Adresse" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="id_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de pièce d'identité</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Type de pièce" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="id_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de pièce d'identité</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Numéro de pièce" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profession</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Profession" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsNewClientDialogOpen(false);
                    setClientToRegister(null);
                  }}
                >
                  Annuler
                </Button>
                
                <Button 
                  type="submit"
                  disabled={createClient.isPending}
                >
                  {createClient.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
