
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Définition du schéma de validation
const formSchema = z.object({
  full_name: z.string().min(2, 'Le nom complet est requis'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().min(3, 'Adresse requise'),
  profession: z.string().min(2, 'Profession requise'),
  monthly_income: z.string().regex(/^\d+$/, 'Montant invalide'),
  source_of_income: z.string().min(2, 'Source de revenus requise'),
});

type FormValues = z.infer<typeof formSchema>;

interface AdhesionRequestFormProps {
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<FormValues>;
  sfdName?: string;
}

const AdhesionRequestForm: React.FC<AdhesionRequestFormProps> = ({
  onSubmit,
  isSubmitting,
  defaultValues,
  sfdName
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      address: '',
      profession: '',
      monthly_income: '',
      source_of_income: '',
      ...defaultValues
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <p className="text-blue-700 text-sm">
            Veuillez remplir ce formulaire pour rejoindre <strong>{sfdName || 'cette SFD'}</strong>. 
            Un agent SFD validera votre demande.
          </p>
        </div>

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Entrez votre nom complet" {...field} />
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
                <Input placeholder="Ex: 73 XX XX XX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="votre@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Textarea placeholder="Entrez votre adresse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profession</FormLabel>
              <FormControl>
                <Input placeholder="Votre profession" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monthly_income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Revenu mensuel (FCFA)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: 150000" 
                  {...field} 
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source_of_income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Source de revenus</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salary">Salaire</SelectItem>
                    <SelectItem value="business">Commerce</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="pension">Pension</SelectItem>
                    <SelectItem value="rental">Revenus locatifs</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Soumission...
            </>
          ) : (
            "Soumettre ma demande"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AdhesionRequestForm;
