
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
import { Loader2, AlertCircle, UserPlus, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateSfdMutation } from '@/components/admin/hooks/sfd-management/mutations/useCreateSfdMutation';
import { sfdFormSchema, SfdFormValues } from './schemas/sfdFormSchema';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [adminLoadError, setAdminLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<SfdFormValues>({
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
    setAdminLoadError(null);
    try {
      console.log("Fetching existing SFD admins...");
      
      // Call the fetch-admin-users Edge Function
      const { data, error } = await supabase.functions.invoke('fetch-admin-users', {
        method: 'POST',
        body: JSON.stringify({ timestamp: Date.now() }) // Add timestamp to prevent caching
      });
      
      if (error) {
        console.error("Error calling fetch-admin-users:", error);
        throw new Error(`Erreur lors de la récupération des administrateurs: ${error.message}`);
      }
      
      if (!data || !Array.isArray(data)) {
        console.error("Invalid response format:", data);
        throw new Error("Format de réponse invalide");
      }
      
      // Filter to only include sfd_admin role
      const sfdAdmins = data.filter(admin => admin.role === 'sfd_admin');
      
      if (sfdAdmins.length === 0) {
        console.warn("No SFD admins found in the response");
        
        // Attempt to get from admin_users table directly as fallback
        const { data: adminUsers, error: adminError } = await supabase
          .from('admin_users')
          .select('id, email, full_name')
          .eq('role', 'sfd_admin');
          
        if (adminError) {
          console.error("Error fetching from admin_users:", adminError);
        } else if (adminUsers && adminUsers.length > 0) {
          console.log(`Found ${adminUsers.length} admins in admin_users table`);
          setExistingAdmins(adminUsers);
          return;
        }
        
        // If still no admins, show error message
        setAdminLoadError("Aucun administrateur SFD disponible. Veuillez d'abord créer un administrateur SFD.");
      } else {
        console.log(`Found ${sfdAdmins.length} SFD admins:`, sfdAdmins);
        setExistingAdmins(sfdAdmins);
      }
    } catch (err: any) {
      console.error('Error fetching existing admins:', err);
      setAdminLoadError(err.message || "Impossible de récupérer les administrateurs");
    } finally {
      setIsLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (open && selectedTab === 'existing-admin') {
      fetchExistingAdmins();
    }
  }, [open, selectedTab]);

  const handleSubmit = async (values: SfdFormValues) => {
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
          email: values.adminEmail || '',
          password: values.adminPassword || '',
          full_name: values.adminName || ''
        };
      } else if (selectedTab === 'existing-admin' && selectedAdmin) {
        existingAdminId = selectedAdmin;
      }
      
      console.log("Submitting SFD creation request:", {
        createAdmin,
        hasAdminData: !!adminData,
        existingAdminId
      });
      
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
  
  const handleRefreshAdmins = () => {
    fetchExistingAdmins();
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
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel className="text-sm font-medium">Sélectionner un administrateur existant</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRefreshAdmins}
                        disabled={isLoadingAdmins}
                      >
                        {isLoadingAdmins ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        <span className="ml-1">Rafraîchir</span>
                      </Button>
                    </div>
                    
                    {adminLoadError && (
                      <Alert variant="destructive" className="mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{adminLoadError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {isLoadingAdmins ? (
                      <div className="flex items-center justify-center py-4 bg-muted/20 rounded-md">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="ml-2">Chargement des administrateurs...</span>
                      </div>
                    ) : existingAdmins.length > 0 ? (
                      <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un administrateur" />
                        </SelectTrigger>
                        <SelectContent>
                          {existingAdmins.map(admin => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.full_name} ({admin.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="bg-muted/20 p-4 rounded flex flex-col items-center justify-center">
                        <UserPlus className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center mb-1">
                          Aucun administrateur SFD disponible
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          Créez un nouvel administrateur SFD ou utilisez l'option "Nouvel Admin"
                        </p>
                      </div>
                    )}
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
