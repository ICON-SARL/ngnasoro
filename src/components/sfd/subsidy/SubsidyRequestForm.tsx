
import React, { useState } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileUpload } from '@/components/ui/file-upload';
import { AlertCircle, Loader2 } from 'lucide-react';

// Validation schema
const subsidyRequestSchema = z.object({
  amount: z
    .string()
    .min(1, "Le montant est requis")
    .transform(val => parseFloat(val))
    .refine(val => !isNaN(val) && val > 0, {
      message: "Le montant doit être un nombre positif",
    }),
  purpose: z.string().min(5, "L'objet de la demande est requis"),
  justification: z.string().min(20, "Une justification détaillée est requise"),
  region: z.string().min(1, "La région est requise"),
  expected_impact: z.string().min(20, "L'impact attendu est requis"),
  priority: z.enum(["low", "normal", "high"], {
    required_error: "Veuillez sélectionner une priorité",
  }),
});

interface SubsidyRequestFormProps {
  onSuccess?: () => void;
}

export function SubsidyRequestForm({ onSuccess }: SubsidyRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const form = useForm<z.infer<typeof subsidyRequestSchema>>({
    resolver: zodResolver(subsidyRequestSchema),
    defaultValues: {
      amount: "",
      purpose: "",
      justification: "",
      region: "",
      expected_impact: "",
      priority: "normal",
    },
  });

  const createSubsidyRequest = useMutation({
    mutationFn: async (values: z.infer<typeof subsidyRequestSchema>) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      
      // Créer la demande de subvention
      const { data: requestData, error: requestError } = await supabase
        .from("subsidy_requests")
        .insert({
          sfd_id: "default", // À remplacer par l'ID SFD réel
          amount: values.amount,
          purpose: values.purpose,
          justification: values.justification,
          region: values.region,
          expected_impact: values.expected_impact,
          priority: values.priority,
          requested_by: user.id,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Télécharger les fichiers si nécessaire
      if (files.length > 0) {
        const documentUrls: string[] = [];
        
        for (const file of files) {
          const filePath = `subsidy-documents/${requestData.id}/${Date.now()}-${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: urlData } = await supabase.storage
            .from("documents")
            .getPublicUrl(filePath);
            
          documentUrls.push(urlData.publicUrl);
        }
        
        // Mettre à jour la demande avec les URLs des documents
        await supabase
          .from("subsidy_requests")
          .update({
            supporting_documents: documentUrls,
          })
          .eq("id", requestData.id);
      }

      // Créer une activité pour la demande
      await supabase.from("subsidy_request_activities").insert({
        request_id: requestData.id,
        activity_type: "create",
        description: "Demande de subvention créée",
        performed_by: user.id,
      });

      return requestData;
    },
    onSuccess: () => {
      toast({
        title: "Demande créée",
        description: "Votre demande de subvention a été créée avec succès",
      });
      form.reset();
      setFiles([]);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof subsidyRequestSchema>) => {
    setUploading(true);
    try {
      await createSubsidyRequest.mutateAsync(values);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Alert className="bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Ce formulaire vous permet de soumettre une demande de prêt au MEREF.
            Veillez à fournir des informations précises et complètes pour faciliter le traitement.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant demandé (FCFA)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ex: 5000000" {...field} />
                </FormControl>
                <FormDescription>
                  Montant total de la subvention demandée
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une priorité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Niveau de priorité de cette demande
                </FormDescription>
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
              <FormLabel>Objet de la demande</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Financement de microcrédits ruraux" {...field} />
              </FormControl>
              <FormDescription>
                Intitulé concis décrivant l'objectif principal de la demande
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
              <FormLabel>Région concernée</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Région Centre" {...field} />
              </FormControl>
              <FormDescription>
                Région géographique où le projet sera mis en œuvre
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="justification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Justification</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Expliquez les raisons qui motivent cette demande de financement..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Détaillez les raisons qui justifient cette demande
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expected_impact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Impact attendu</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez l'impact attendu de ce financement..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Expliquez l'impact socio-économique attendu
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardContent className="pt-6">
            <FormLabel className="mb-2 block">Documents justificatifs</FormLabel>
            <FileUpload
              value={files}
              onChange={setFiles}
              maxFiles={5}
              maxSize={5 * 1024 * 1024} // 5MB
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "application/msword": [".doc"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
                  ".docx",
                ],
              }}
            />
            <FormDescription className="mt-2">
              Ajoutez des documents pour appuyer votre demande (plan d'affaires, états financiers, etc.).
              Formats acceptés: PDF, JPG, PNG, DOC, DOCX.
            </FormDescription>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Annuler
          </Button>
          <Button type="submit" disabled={uploading || createSubsidyRequest.isPending}>
            {(uploading || createSubsidyRequest.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Soumettre la demande
          </Button>
        </div>
      </form>
    </Form>
  );
}
