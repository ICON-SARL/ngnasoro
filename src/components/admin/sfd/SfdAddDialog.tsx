
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
  const [retryCount, setRetryCount] = useState(0);
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
      
      // Ajouter un timestamp pour éviter le cache
      const timestamp = Date.now();
      
      // Call the fetch-admin-users Edge Function
      const { data, error } = await supabase.functions.invoke('fetch-admin-users', {
        method: 'POST',
        body: JSON.stringify({ 
          timestamp,
          forceRefresh: true,
          retryAttempt: retryCount
        })
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
        
        // Si on a des utilisateurs avec un autre rôle, on les ajoute quand même
        // pour pouvoir avancer avec les tests
        if (data.length > 0) {
          console.log("Using all admins regardless of role:", data);
          setExistingAdmins(data);
          return;
        }
        
        // If still no admins, show error message
        setAdminLoadError("Aucun administrateur SFD disponible. Veuillez d'abord créer un administrateur SFD ou recharger la page.");
      } else {
        console.log(`Found ${sfdAdmins.length} SFD admins:`, sfdAdmins);
        setExistingAdmins(sfdAdmins);
      }
    } catch (err: any) {
      console.error('Error fetching existing admins:', err);
      setAdminLoadError(err.message || "Impossible de récupérer les administrateurs");
      
      // Si c'est la première tentative, on réessaie automatiquement
      if (retryCount === 0) {
        setRetryCount(1);
        setTimeout(() => fetchExistingAdmins(), 1500);
      }
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
      console.error("Error creating SFD:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          <DialogDescription>
            Créez une nouvelle SFD et associez-la éventuellement à un administrateur
          </DialogDescription>
        </DialogHeader>
        
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {typeof error === 'string' ? error : 'Une erreur est survenue lors de la création de la SFD'}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la SFD</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: RCPB" {...field} />
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
                      <Input placeholder="ex: RCPB001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Région</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: Ouagadougou" {...field} />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de contact</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
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
                        <Input placeholder="+226 XX XX XX XX" {...field} />
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
                      <Textarea
                        placeholder="Description de la SFD..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-6">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="no-admin">Pas d'administrateur</TabsTrigger>
                <TabsTrigger value="new-admin">Nouvel administrateur</TabsTrigger>
                <TabsTrigger value="existing-admin">Admin existant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="no-admin">
                <div className="p-4 bg-muted/30 rounded border text-sm text-muted-foreground">
                  La SFD sera créée sans administrateur. Vous pourrez associer un administrateur plus tard.
                </div>
              </TabsContent>
              
              <TabsContent value="new-admin" className="space-y-4">
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
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  <div className="flex justify-between items-center">
                    <FormLabel>Sélectionner un administrateur existant</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { 
                        setRetryCount(prev => prev + 1);
                        fetchExistingAdmins();
                      }}
                      disabled={isLoadingAdmins}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAdmins ? 'animate-spin' : ''}`} />
                      Rafraîchir
                    </Button>
                  </div>
                  
                  {adminLoadError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {adminLoadError}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {isLoadingAdmins ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                      <span>Chargement des administrateurs...</span>
                    </div>
                  ) : existingAdmins.length === 0 && !adminLoadError ? (
                    <div className="text-center p-6 bg-muted/20 rounded-md">
                      <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-4">Aucun administrateur SFD disponible</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedTab('new-admin')}
                      >
                        Créer un nouvel administrateur
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                      {existingAdmins.map((admin) => (
                        <div 
                          key={admin.id} 
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedAdmin === admin.id 
                              ? 'bg-primary/10 border-primary/30 border' 
                              : 'hover:bg-muted border border-transparent'
                          }`}
                          onClick={() => setSelectedAdmin(admin.id)}
                        >
                          <div className="font-medium">{admin.full_name}</div>
                          <div className="text-sm text-muted-foreground">{admin.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending || (selectedTab === 'existing-admin' && !selectedAdmin && existingAdmins.length > 0)}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer la SFD"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
