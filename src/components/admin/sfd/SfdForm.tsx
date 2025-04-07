import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sfd } from '../types/sfd-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REGIONS } from '@/components/admin/subsidy/request-create/constants';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Le nom doit contenir au moins 3 caractères',
  }),
  code: z.string().min(2, {
    message: 'Le code doit contenir au moins 2 caractères',
  }),
  region: z.string().min(2, {
    message: 'La région doit être spécifiée',
  }),
  contact_email: z.string().email({
    message: 'Format d\'email invalide',
  }).optional().or(z.literal('')),
  phone: z.string().optional(),
  status: z.enum(['active', 'pending', 'suspended']),
  logo_url: z.string().optional(),
  legal_document_url: z.string().optional(),
  subsidy_balance: z.number().optional(),
});

export type SfdFormValues = z.infer<typeof formSchema>;

interface SfdFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SfdFormValues) => void;
  initialData?: Partial<Sfd>;
  title: string;
  isPending: boolean;
}

export function SfdForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  isPending,
}: SfdFormProps) {
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<SfdFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      code: initialData?.code || '',
      region: initialData?.region || '',
      contact_email: initialData?.contact_email || '',
      phone: initialData?.phone || '',
      status: (initialData?.status as 'active' | 'pending' | 'suspended') || 'active',
      logo_url: initialData?.logo_url || '',
      legal_document_url: initialData?.legal_document_url || '',
      subsidy_balance: initialData?.subsidy_balance || 0,
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoFile(file);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDocumentFile(file);
  };

  const uploadFiles = async (formData: SfdFormValues) => {
    setIsUploading(true);
    const fileUploads = [];
    const updatedFormData = { ...formData };

    try {
      if (logoFile) {
        const logoFileName = `${Date.now()}-${logoFile.name}`;
        const { error: logoError } = await supabase.storage
          .from('sfd-logos')
          .upload(logoFileName, logoFile);

        if (logoError) throw new Error(`Erreur lors de l'upload du logo: ${logoError.message}`);

        const { data: logoUrlData } = supabase.storage
          .from('sfd-logos')
          .getPublicUrl(logoFileName);

        updatedFormData.logo_url = logoUrlData.publicUrl;
      }

      if (documentFile) {
        const docFileName = `${Date.now()}-${documentFile.name}`;
        const { error: docError } = await supabase.storage
          .from('sfd-documents')
          .upload(docFileName, documentFile);

        if (docError) throw new Error(`Erreur lors de l'upload du document: ${docError.message}`);

        const { data: docUrlData } = supabase.storage
          .from('sfd-documents')
          .getPublicUrl(docFileName);

        updatedFormData.legal_document_url = docUrlData.publicUrl;
      }

      setIsUploading(false);
      return updatedFormData;
    } catch (error: any) {
      setIsUploading(false);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue pendant l'upload des fichiers",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSubmit = async (values: SfdFormValues) => {
    if (logoFile || documentFile) {
      const dataWithUploads = await uploadFiles(values);
      if (dataWithUploads) {
        onSubmit(dataWithUploads);
      }
    } else {
      onSubmit(values);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
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
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Code de la SFD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {REGIONS.map((region) => (
                          <SelectItem key={region} value={region}>{region}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
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
                      <Input type="email" placeholder="email@sfd.com" {...field} />
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
                      <Input placeholder="+221 XX XXX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="subsidy_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solde de Subvention (FCFA)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Logo (optionnel)</FormLabel>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Cliquez pour uploader</span>
                      </p>
                      <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 2MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
                {logoFile && (
                  <p className="text-sm text-blue-600">{logoFile.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <FormLabel>Document légal (optionnel)</FormLabel>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Cliquez pour uploader</span>
                      </p>
                      <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf"
                      onChange={handleDocumentChange}
                    />
                  </label>
                </div>
                {documentFile && (
                  <p className="text-sm text-blue-600">{documentFile.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending || isUploading}>
                {isPending || isUploading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
