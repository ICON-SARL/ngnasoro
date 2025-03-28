
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sfd } from '@/components/admin/types/sfd-types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  code: z.string().min(2, {
    message: "Le code doit contenir au moins 2 caractères.",
  }),
  region: z.string().optional(),
  status: z.enum(["active", "suspended", "pending"]),
  admin_id: z.string().optional(),
  subsidy_balance: z.coerce.number().optional(),
  logo_url: z.string().optional(),
});

export type SfdFormValues = z.infer<typeof formSchema>;

interface SfdFormProps {
  defaultValues?: Partial<SfdFormValues>;
  onSubmit: (values: SfdFormValues) => void;
  isLoading?: boolean;
  isCreate?: boolean;
}

export function SfdForm({ defaultValues, onSubmit, isLoading = false, isCreate = false }: SfdFormProps) {
  const form = useForm<SfdFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      region: "",
      status: "active",
      admin_id: "",
      subsidy_balance: 0,
      logo_url: "",
      ...defaultValues,
    },
  });

  // Fetch SFD admins for dropdown
  const { data: sfdAdmins, isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['sfdAdmins'],
    queryFn: async () => {
      // First, get all users with sfd_admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'sfd_admin');
      
      if (roleError) throw roleError;
      
      if (!roleData || roleData.length === 0) {
        return [];
      }
      
      // Get user details for each admin
      const userIds = roleData.map(item => item.user_id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
        
      if (profileError) throw profileError;
      
      // Get emails from auth.users (need to use admin functions)
      const adminsWithDetails = await Promise.all(
        (profileData || []).map(async (profile) => {
          try {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
            
            if (userError) {
              console.error('Error fetching user details:', userError);
              return {
                id: profile.id,
                full_name: profile.full_name || 'Unknown',
                email: 'No email available'
              };
            }
            
            return {
              id: profile.id,
              full_name: profile.full_name || userData.user.user_metadata?.full_name || 'Unknown',
              email: userData.user.email || 'No email available'
            };
          } catch (error) {
            console.error('Error in admin lookup:', error);
            return {
              id: profile.id,
              full_name: profile.full_name || 'Unknown',
              email: 'Error fetching email'
            };
          }
        })
      );
      
      return adminsWithDetails;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la SFD</FormLabel>
                <FormControl>
                  <Input placeholder="Nom de la SFD" {...field} />
                </FormControl>
                <FormDescription>
                  Nom complet de la Structure de Financement Décentralisée
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code SFD</FormLabel>
                <FormControl>
                  <Input placeholder="Code unique" {...field} />
                </FormControl>
                <FormDescription>
                  Code unique d'identification pour la SFD
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Région</FormLabel>
                <FormControl>
                  <Input placeholder="Région" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  Région géographique d'opération
                </FormDescription>
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="suspended">Suspendue</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Statut actuel de la SFD
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="admin_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin SFD</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un admin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucun admin assigné</SelectItem>
                    {sfdAdmins && sfdAdmins.map((admin) => (
                      <SelectItem key={admin.id} value={admin.id}>
                        {admin.full_name} ({admin.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Administrateur assigné à cette SFD
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subsidy_balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solde de subvention (FCFA)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : Number(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Montant total des subventions accordées
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL du Logo</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  URL de l'image du logo de la SFD
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Traitement en cours..." : isCreate ? "Créer la SFD" : "Mettre à jour la SFD"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
