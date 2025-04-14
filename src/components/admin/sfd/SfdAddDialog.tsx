
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateSfdMutation } from '@/components/admin/hooks/sfd-management/mutations/useCreateSfdMutation';
import { sfdFormSchema } from './schemas/sfdFormSchema';
import { supabase } from '@/integrations/supabase/client';

interface SfdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExistingAdmin {
  id: string;
  email: string;
  full_name: string;
}

export function SfdAddDialog({ open, onOpenChange }: SfdAddDialogProps) {
  const { mutateAsync, isPending, isError, error } = useCreateSfdMutation();
  const [selectedTab, setSelectedTab] = useState<string>('no-admin');
  const [existingAdmins, setExistingAdmins] = useState<ExistingAdmin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<string>('');
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

  const form = useForm({
    resolver: zodResolver(sfdFormSchema),
    defaultValues: {
      name: '',
      code: '',
      region: '',
      status: 'active',
      description: '',
      contact_email: '',
      phone: '',
      // Valeurs pour le formulaire d'administrateur
      adminEmail: '',
      adminPassword: '',
      adminName: '',
    },
  });

  const fetchExistingAdmins = async () => {
    setIsLoadingAdmins(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name')
        .eq('role', 'sfd_admin');
        
      if (error) throw error;
      setExistingAdmins(data || []);
    } catch (err) {
      console.error('Error fetching existing admins:', err);
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (open && selectedTab === 'existing-admin') {
      fetchExistingAdmins();
    }
  }, [open, selectedTab]);

  const handleSubmit = async (values: any) => {
    try {
      const sfdData = {
        name: values.name,
        code: values.code,
        region: values.region || null,
        status: values.status || 'active',
        description: values.description || null,
        contact_email: values.contact_email || null,
        phone: values.phone || null,
      };
      
      let adminData = null;
      let createAdmin = false;
      let existingAdminId = null;
      
      if (selectedTab === 'new-admin') {
        createAdmin = true;
        adminData = {
          email: values.adminEmail,
          password: values.adminPassword,
          full_name: values.adminName
        };
      } else if (selectedTab === 'existing-admin' && selectedAdmin) {
        existingAdminId = selectedAdmin;
      }
      
      await mutateAsync({ 
        sfdData, 
        createAdmin, 
        adminData,
        existingAdminId
      });
      
      onOpenChange(false);
      form.reset();
      setSelectedTab('no-admin');
      setSelectedAdmin('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la SFD:', error);
    }
  };

  // Reset form state when dialog is closed
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedTab('no-admin');
      setSelectedAdmin('');
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          <DialogDescription>
            Remplissez les informations nécessaires pour créer une nouvelle SFD
          </DialogDescription>
        </DialogHeader>
        
        {isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error 
                ? error.message 
                : "Une erreur s'est produite lors de l'ajout de la SFD"}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de la SFD</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de la SFD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code de la SFD</FormLabel>
                      <FormControl>
                        <Input placeholder="Code unique" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Région</FormLabel>
                      <FormControl>
                        <Input placeholder="Région d'opération" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...field}
                        >
                          <option value="active">Actif</option>
                          <option value="pending">En attente</option>
                          <option value="suspended">Suspendu</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de contact</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@sfd.com" {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Input placeholder="+123 456 789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description de la SFD..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-base font-medium mb-2">Options d'administrateur</h3>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="no-admin">Sans Admin</TabsTrigger>
                  <TabsTrigger value="new-admin">Nouvel Admin</TabsTrigger>
                  <TabsTrigger value="existing-admin">Admin Existant</TabsTrigger>
                </TabsList>
                
                <TabsContent value="no-admin">
                  <p className="text-sm text-muted-foreground">
                    La SFD sera créée sans administrateur. Vous pourrez l'associer à un utilisateur plus tard.
                  </p>
                </TabsContent>
                
                <TabsContent value="new-admin" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="adminName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de l'administrateur" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@sfd.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mot de passe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="existing-admin">
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Sélectionner un administrateur existant</FormLabel>
                      <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un administrateur" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingAdmins ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : existingAdmins.length > 0 ? (
                            existingAdmins.map(admin => (
                              <SelectItem key={admin.id} value={admin.id}>
                                {admin.full_name} ({admin.email})
                              </SelectItem>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground p-2">
                              Aucun administrateur SFD disponible
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isPending || (selectedTab === 'existing-admin' && !selectedAdmin)}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer la SFD'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
