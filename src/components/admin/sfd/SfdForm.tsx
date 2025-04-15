import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SfdFormValues, sfdFormSchema } from './schemas/sfdFormSchema';
import { Loader2 } from 'lucide-react';

interface SfdFormProps {
  defaultValues?: SfdFormValues;
  onSubmit: (data: SfdFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  formMode: 'create' | 'edit';
  sfdId?: string;
}

export function SfdForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  formMode,
  sfdId
}: SfdFormProps) {
  const form = useForm<SfdFormValues>({
    resolver: zodResolver(sfdFormSchema),
    defaultValues: defaultValues || {
      name: '',
      code: '',
      region: '',
      description: '',
      contact_email: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      logo_url: '',
      legal_document_url: '',
      ...(formMode === 'create' ? { subsidy_balance: 0 } : {}),
    },
  });

  const handleSubmit = (data: SfdFormValues) => {
    console.log("SfdForm: handleSubmit called with", data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form id="sfd-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Nom de la SFD*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Entrez le nom" 
                    {...field} 
                    className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Code Field */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Code*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Code unique" 
                    {...field} 
                    className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Region Field */}
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Région</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Région" 
                    {...field} 
                    className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                    value={field.value || ''}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Status Field */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Statut</FormLabel>
                <FormControl>
                  <select 
                    {...field}
                    className="h-9 w-full text-sm rounded-md border border-slate-300 focus:border-blue-400 bg-white"
                    disabled={isLoading}
                  >
                    <option value="active">Actif</option>
                    <option value="pending">En attente</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Email Field */}
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Email de contact</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="contact@example.com" 
                    {...field} 
                    className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                    value={field.value || ''}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Email Field (added for compatibility) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="info@example.com" 
                    {...field} 
                    className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                    value={field.value || ''}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone Field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Téléphone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+223 7X XX XX XX" 
                    {...field} 
                    className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                    value={field.value || ''}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Address Field */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Adresse</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Adresse" 
                    {...field} 
                    className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                    value={field.value || ''}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Logo URL Field */}
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-slate-700">URL du logo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/logo.png" 
                  {...field} 
                  className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm text-slate-700">Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Description de la SFD" 
                  {...field} 
                  className="min-h-24 text-sm rounded-md border-slate-300 focus:border-blue-400"
                  value={field.value || ''}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* Subsidy Balance Field - Only show in create mode */}
        {formMode === 'create' && (
          <FormField
            control={form.control}
            name="subsidy_balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-700">Subvention initiale (FCFA)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    className="h-9 text-sm rounded-md border-slate-300 focus:border-blue-400"
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                    value={field.value || 0}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="animate-spin h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm text-blue-500">Traitement en cours...</span>
          </div>
        )}
      </form>
    </Form>
  );
}
