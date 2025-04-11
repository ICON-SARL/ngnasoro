
import React, { useState } from 'react';
import { z } from 'zod';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateSfdMutation } from '@/components/admin/hooks/sfd-management/mutations/useCreateSfdMutation';

const sfdSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  code: z.string().min(1, { message: 'Le code est requis' }),
  region: z.string().optional(),
  status: z.enum(['active', 'pending', 'suspended']).default('active'),
  logo_url: z.string().optional().nullable(),
  contact_email: z.string().email({ message: 'Email invalide' }).optional().nullable(),
  phone: z.string().optional().nullable(),
  legal_document_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  subsidy_balance: z.number().optional(),
});

const adminSchema = z.object({
  full_name: z.string().min(1, { message: 'Nom complet requis' }),
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
});

const formSchema = z.object({
  sfdData: sfdSchema,
  createAdmin: z.boolean().default(false),
  adminData: adminSchema.optional(),
});

type SfdFormValues = z.infer<typeof sfdSchema>;
type AdminFormValues = z.infer<typeof adminSchema>;
type FormValues = z.infer<typeof formSchema>;

interface SfdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SfdAddDialog({ open, onOpenChange }: SfdAddDialogProps) {
  const [activeTab, setActiveTab] = useState('sfd');
  const createSfdMutation = useCreateSfdMutation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sfdData: {
        name: '',
        code: '',
        region: '',
        status: 'active',
        description: '',
        subsidy_balance: 0,
      },
      createAdmin: false,
      adminData: {
        full_name: '',
        email: '',
        password: '',
      },
    },
  });
  
  const createAdmin = form.watch('createAdmin');
  
  const handleSubmit = async (values: FormValues) => {
    try {
      await createSfdMutation.mutateAsync({
        sfdData: values.sfdData,
        createAdmin: values.createAdmin,
        adminData: values.createAdmin ? values.adminData : undefined
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Erreur lors de la création de la SFD:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          <DialogDescription>
            Créez une nouvelle SFD et associez-lui optionnellement un administrateur
          </DialogDescription>
        </DialogHeader>
        
        {createSfdMutation.isError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createSfdMutation.error instanceof Error 
                ? createSfdMutation.error.message 
                : "Une erreur s'est produite lors de la création de la SFD"}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sfd">Information SFD</TabsTrigger>
                <TabsTrigger value="admin">Admin SFD</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sfd" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sfdData.name"
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
                    name="sfdData.code"
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
                    name="sfdData.region"
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
                    name="sfdData.status"
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
                    name="sfdData.contact_email"
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
                    name="sfdData.phone"
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
                  name="sfdData.logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL du logo</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/logo.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sfdData.description"
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
                
                <FormField
                  control={form.control}
                  name="sfdData.subsidy_balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subvention initiale (FCFA)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Si vous souhaitez attribuer une subvention initiale à cette SFD
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="createAdmin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Créer un administrateur</FormLabel>
                        <FormDescription>
                          Créez un compte administrateur pour cette SFD
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {createAdmin ? (
                  <div className="pt-2">
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => setActiveTab('admin')}
                    >
                      Configurer l'administrateur
                    </Button>
                  </div>
                ) : null}
              </TabsContent>
              
              <TabsContent value="admin" className="space-y-4 pt-4">
                {createAdmin ? (
                  <>
                    <Alert className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Vous êtes en train de créer un compte administrateur pour cette SFD.
                      </AlertDescription>
                    </Alert>
                    
                    <FormField
                      control={form.control}
                      name="adminData.full_name"
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
                      name="adminData.email"
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
                    
                    <FormField
                      control={form.control}
                      name="adminData.password"
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
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-center text-muted-foreground mb-4">
                      Vous n'avez pas activé la création d'un administrateur pour cette SFD.
                    </p>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        form.setValue('createAdmin', true);
                        setActiveTab('sfd');
                      }}
                    >
                      Activer la création d'un administrateur
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={createSfdMutation.isPending}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={createSfdMutation.isPending}
              >
                {createSfdMutation.isPending ? (
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
