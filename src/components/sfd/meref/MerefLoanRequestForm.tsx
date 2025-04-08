
import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

// Schema de validation
const loanRequestSchema = z.object({
  client_id: z.string().min(1, "Le client est requis"),
  amount: z
    .string()
    .min(1, "Le montant est requis")
    .transform((val) => parseFloat(val.replace(/,/g, "")))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Le montant doit être un nombre positif",
    }),
  duration_months: z
    .string()
    .min(1, "La durée est requise")
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "La durée doit être un nombre positif",
    }),
  purpose: z.string().min(3, "L'objet du prêt est requis"),
  guarantees: z.string().optional(),
  monthly_income: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return parseFloat(val.replace(/,/g, ""));
    })
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: "Le revenu doit être un nombre positif",
    }),
});

interface MerefLoanRequestFormProps {
  onSuccess?: () => void;
}

export function MerefLoanRequestForm({ onSuccess }: MerefLoanRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeSfdId } = useSfdDataAccess();
  const [clients, setClients] = useState<{ value: string, label: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Formulaire
  const form = useForm<z.infer<typeof loanRequestSchema>>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      client_id: "",
      amount: "",
      duration_months: "",
      purpose: "",
      guarantees: "",
      monthly_income: "",
    },
  });
  
  // Chargement des clients
  React.useEffect(() => {
    const loadClients = async () => {
      if (activeSfdId) {
        const { data, error } = await supabase
          .from('sfd_clients')
          .select('id, full_name')
          .eq('sfd_id', activeSfdId)
          .eq('status', 'validated')
          .order('full_name');
          
        if (!error && data) {
          const clientOptions = data.map(client => ({
            value: client.id,
            label: client.full_name
          }));
          setClients(clientOptions);
        }
      }
    };
    
    loadClients();
  }, [activeSfdId]);
  
  // Mutation pour créer une demande
  const createLoanRequest = useMutation({
    mutationFn: async (values: z.infer<typeof loanRequestSchema>) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      if (!activeSfdId) throw new Error("Aucune SFD active sélectionnée");
      
      // Créer la demande de prêt
      const { data, error } = await supabase
        .from('meref_loan_requests')
        .insert({
          sfd_id: activeSfdId,
          client_id: values.client_id,
          amount: values.amount,
          duration_months: values.duration_months,
          purpose: values.purpose,
          guarantees: values.guarantees || null,
          monthly_income: values.monthly_income || null,
          status: 'draft',
          created_by: user.id,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Télécharger les documents
      if (uploadedFiles.length > 0) {
        setIsUploading(true);
        try {
          for (const file of uploadedFiles) {
            const documentType = getDocumentType(file.name);
            const filePath = `meref-documents/${data.id}/${Date.now()}-${file.name}`;
            
            const { error: uploadError } = await supabase
              .storage
              .from('loan-documents')
              .upload(filePath, file);
              
            if (uploadError) throw uploadError;
            
            // Obtenir l'URL publique
            const { data: urlData } = await supabase
              .storage
              .from('loan-documents')
              .getPublicUrl(filePath);
              
            // Enregistrer le document dans la base de données
            await supabase
              .from('meref_request_documents')
              .insert({
                request_id: data.id,
                document_type: documentType,
                document_url: urlData.publicUrl,
                filename: file.name,
                uploaded_by: user.id
              });
          }
        } finally {
          setIsUploading(false);
        }
      }
      
      // Ajouter une activité
      await supabase
        .from('meref_request_activities')
        .insert({
          request_id: data.id,
          activity_type: 'create',
          description: 'Demande créée',
          performed_by: user.id
        });
        
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Demande créée",
        description: "La demande de prêt MEREF a été créée avec succès",
      });
      form.reset();
      setUploadedFiles([]);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
      });
    },
  });
  
  const getDocumentType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (filename.toLowerCase().includes('identite') || 
        filename.toLowerCase().includes('cni') || 
        filename.toLowerCase().includes('id')) {
      return 'identity_card';
    } else if (filename.toLowerCase().includes('salaire') || 
               filename.toLowerCase().includes('payslip')) {
      return 'payslip';
    } else if (filename.toLowerCase().includes('banque') || 
               filename.toLowerCase().includes('bank')) {
      return 'bank_statement';
    } else if (filename.toLowerCase().includes('garantie') || 
               filename.toLowerCase().includes('guarantee')) {
      return 'guarantees';
    } else {
      return 'other';
    }
  };
  
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const onSubmit = (values: z.infer<typeof loanRequestSchema>) => {
    createLoanRequest.mutate(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert className="bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Cette demande sera d'abord vérifiée en interne avant d'être transmise au MEREF.
            Assurez-vous que toutes les informations sont exactes et complètes.
          </AlertDescription>
        </Alert>
        
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Client</FormLabel>
              <Combobox
                items={clients}
                value={field.value}
                onChange={field.onChange}
                placeholder="Sélectionnez un client"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant du prêt (FCFA)</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Ex: 500000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="duration_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée (mois)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex: 12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objet du prêt</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Financement d'activités agricoles" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="guarantees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Garanties</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Décrivez les garanties proposées..."
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Détaillez les garanties fournies par le client pour ce prêt
                </FormDescription>
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
                  <Input type="text" placeholder="Ex: 150000" {...field} />
                </FormControl>
                <FormDescription>
                  Revenu mensuel du client servant à évaluer sa capacité de remboursement
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <FormLabel>Documents justificatifs</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ajouter des documents
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFilesChange}
                />
              </div>
              
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2 mt-4">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex items-center justify-center bg-gray-100 rounded mr-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed rounded-md p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Ajoutez des documents justificatifs: CNI, bulletins de salaire, etc.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          {onSuccess && (
            <Button type="button" variant="outline" onClick={onSuccess}>
              Annuler
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={createLoanRequest.isPending || isUploading}
          >
            {(createLoanRequest.isPending || isUploading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Créer la demande
          </Button>
        </div>
      </form>
    </Form>
  );
}
