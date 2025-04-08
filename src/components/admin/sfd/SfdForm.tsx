
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

interface SfdFormProps {
  defaultValues?: SfdFormValues;
  onSubmit: (data: SfdFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  formMode: 'create' | 'edit';
  sfdId?: string;
}

export function SfdForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
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
      email: '',
      contact_email: '',
      phone: '',
      address: '',
      status: 'active',
      subsidy_balance: 0,
      logo_url: '',
      legal_document_url: '',
    },
  });

  const handleSubmit = (data: SfdFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form id="sfd-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Nom de la SFD*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Entrez le nom" 
                    {...field} 
                    className="rounded-md border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Code Field */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Code SFD*</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Code unique" 
                    {...field} 
                    className="rounded-md border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Region Field */}
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Région</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Région d'opération" 
                    {...field} 
                    className="rounded-md border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Email principal" 
                    type="email" 
                    {...field} 
                    className="rounded-md border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Email Field */}
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Email de contact</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Email de contact" 
                    type="email" 
                    {...field} 
                    className="rounded-md border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Téléphone</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Numéro de téléphone" 
                    {...field} 
                    className="rounded-md border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address Field */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-slate-700">Adresse</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Adresse physique" 
                    {...field} 
                    className="rounded-md border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel className="text-slate-700">Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Description de la SFD" 
                    rows={4}
                    {...field} 
                    className="rounded-md border-slate-300 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
