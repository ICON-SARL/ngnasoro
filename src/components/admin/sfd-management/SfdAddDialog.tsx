
import React, { useState } from 'react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { z } from 'zod';
import { useCreateSfdMutation } from '../hooks/sfd-management/mutations';

// SFD schema for validation
const sfdSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  code: z.string().min(1, { message: 'Le code est requis' }),
  region: z.string().optional(),
  status: z.enum(['active', 'pending', 'suspended']).default('active'),
  description: z.string().optional().nullable(),
  contact_email: z.string().email({ message: 'Email invalide' }).optional().nullable(),
  phone: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
});

// Admin schema for validation
const adminSchema = z.object({
  full_name: z.string().min(1, { message: 'Nom complet requis' }),
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
});

// Combine both schemas
const formSchema = z.object({
  sfd: sfdSchema,
  createAdmin: z.boolean().default(false),
  admin: adminSchema.optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SfdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SfdAddDialog: React.FC<SfdAddDialogProps> = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState('sfd');
  const [createAdmin, setCreateAdmin] = useState(false);
  const createSfdMutation = useCreateSfdMutation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sfd: {
        name: '',
        code: '',
        region: '',
        status: 'active',
        description: '',
        contact_email: '',
        phone: '',
        logo_url: '',
      },
      createAdmin: false,
      admin: {
        full_name: '',
        email: '',
        password: '',
      }
    }
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      // Extract data
      const sfdData = data.sfd;
      
      // Handle the case where createAdmin is true but admin data is undefined
      if (data.createAdmin && !data.admin) {
        form.setError('admin', { message: 'Les informations d\'administrateur sont requises' });
        return;
      }
      
      // Here's the fix - ensure adminData has all required properties when createAdmin is true
      let adminData = undefined;
      
      if (data.createAdmin && data.admin) {
        adminData = {
          email: data.admin.email,
          password: data.admin.password,
          full_name: data.admin.full_name
        };
      }
      
      // Call mutation with properly typed adminData
      await createSfdMutation.mutateAsync({
        sfdData,
        createAdmin: data.createAdmin,
        adminData
      });
      
      // Reset form and close dialog on success
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating SFD:', error);
    }
  };
  
  // Toggle admin creation option
  const handleCreateAdminToggle = (checked: boolean) => {
    setCreateAdmin(checked);
    form.setValue('createAdmin', checked);
    
    if (checked) {
      setActiveTab('admin');
    } else {
      setActiveTab('sfd');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          <DialogDescription>
            Créez une nouvelle institution de microfinance dans le système.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Créer un administrateur SFD</h4>
                <p className="text-sm text-muted-foreground">
                  Vous pouvez créer un compte administrateur pour cette SFD
                </p>
              </div>
              <FormField
                control={form.control}
                name="createAdmin"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleCreateAdminToggle(checked);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sfd">Information SFD</TabsTrigger>
                <TabsTrigger value="admin" disabled={!createAdmin}>
                  Administrateur SFD
                </TabsTrigger>
              </TabsList>
              
              {/* SFD Info Tab */}
              <TabsContent value="sfd" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sfd.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de la SFD*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom de la SFD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sfd.code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code*</FormLabel>
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
                    name="sfd.region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Région</FormLabel>
                        <FormControl>
                          <Input placeholder="Région" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sfd.status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full p-2 border border-gray-300 rounded-md"
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
                    name="sfd.contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de contact</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="contact@example.com" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sfd.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+123 456 789" 
                            {...field} 
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="sfd.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description de la SFD" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sfd.logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL du logo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/logo.png" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Admin Info Tab */}
              <TabsContent value="admin" className="space-y-4 pt-4">
                {createAdmin && (
                  <>
                    <FormField
                      control={form.control}
                      name="admin.full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet*</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de l'administrateur" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="admin.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="admin.password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe*</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Mot de passe" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>
            
            {createSfdMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {(createSfdMutation.error as any)?.message || "Une erreur est survenue lors de la création de la SFD"}
                </AlertDescription>
              </Alert>
            )}
            
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
                  'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
