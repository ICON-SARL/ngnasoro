
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useSfdAccountsCreation } from '@/hooks/useSfdAccountsCreation';

const sfdSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  code: z.string().min(1, { message: 'Le code est requis' }),
  region: z.string().optional(),
  status: z.enum(['active', 'pending', 'suspended']).default('active'),
  contact_email: z.string().email({ message: 'Email invalide' }).optional().nullable(),
  phone: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const adminSchema = z.object({
  full_name: z.string().min(1, { message: 'Nom complet requis' }),
  email: z.string().email({ message: 'Email invalide' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
});

const accountsSchema = z.object({
  includeOperationAccount: z.boolean().default(true),
  includeRepaymentAccount: z.boolean().default(true),
  includeSavingsAccount: z.boolean().default(true),
});

const formSchema = z.object({
  sfdData: sfdSchema,
  adminData: adminSchema,
  accounts: accountsSchema,
});

type FormValues = z.infer<typeof formSchema>;

export function SfdAccountsCreationForm() {
  const { createSfdWithAccounts, isCreating, error } = useSfdAccountsCreation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sfdData: {
        name: '',
        code: '',
        region: '',
        status: 'active',
        description: '',
      },
      adminData: {
        full_name: '',
        email: '',
        password: '',
      },
      accounts: {
        includeOperationAccount: true,
        includeRepaymentAccount: true,
        includeSavingsAccount: true,
      },
    },
  });
  
  const handleSubmit = async (values: FormValues) => {
    try {
      // Préparer les types de comptes basés sur les checkboxes
      const accountTypes: string[] = [];
      if (values.accounts.includeOperationAccount) accountTypes.push('operation');
      if (values.accounts.includeRepaymentAccount) accountTypes.push('remboursement');
      if (values.accounts.includeSavingsAccount) accountTypes.push('epargne');
      
      await createSfdWithAccounts.mutateAsync({
        sfdData: values.sfdData,
        adminData: values.adminData,
        accounts: { types: accountTypes }
      });
      
      // Réinitialiser le formulaire après succès
      form.reset();
    } catch (error) {
      console.error('Erreur lors de la création de la SFD avec comptes:', error);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Création de SFD avec Admin et Comptes</CardTitle>
        <CardDescription>
          Créez une nouvelle SFD avec un administrateur et des comptes associés en une seule opération
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations SFD</h3>
              
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
              </div>
              
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
            </div>
            
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Informations Administrateur</h3>
              
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
              
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
            
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Comptes SFD</h3>
              <FormDescription>
                Sélectionnez les types de comptes à créer pour cette SFD
              </FormDescription>
              
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="accounts.includeOperationAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Compte d'opération</FormLabel>
                        <FormDescription>
                          Compte principal pour les opérations courantes
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accounts.includeRepaymentAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Compte de remboursement</FormLabel>
                        <FormDescription>
                          Compte dédié aux remboursements de prêts
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accounts.includeSavingsAccount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Compte d'épargne</FormLabel>
                        <FormDescription>
                          Compte pour la gestion des épargnes
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <CardFooter className="px-0">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer SFD avec comptes'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
