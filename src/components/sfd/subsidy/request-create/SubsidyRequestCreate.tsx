
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, UploadCloud } from 'lucide-react';

// Validation schema
const subsidyRequestSchema = z.object({
  amount: z.string()
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
  sfd_id: z.string().min(1, "La SFD est requise"),
});

interface SubsidyRequestCreateProps {
  onSuccess?: () => void;
}

export function SubsidyRequestCreate({ onSuccess }: SubsidyRequestCreateProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("form");
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [importData, setImportData] = useState("");
  
  // Formulaire pour la création manuelle
  const form = useForm<z.infer<typeof subsidyRequestSchema>>({
    resolver: zodResolver(subsidyRequestSchema),
    defaultValues: {
      amount: "",
      purpose: "",
      justification: "",
      region: "",
      expected_impact: "",
      priority: "normal",
      sfd_id: "",
    },
  });
  
  // Récupérer la liste des SFD
  const [sfds, setSfds] = useState<any[]>([]);
  
  React.useEffect(() => {
    const fetchSfds = async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name, code')
        .order('name');
        
      if (!error && data) {
        setSfds(data);
        
        // Si une seule SFD, la sélectionner par défaut
        if (data.length === 1) {
          form.setValue('sfd_id', data[0].id);
        }
      }
    };
    
    fetchSfds();
  }, [form]);
  
  // Mutation pour créer une demande
  const createSubsidyRequest = useMutation({
    mutationFn: async (values: z.infer<typeof subsidyRequestSchema>) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      
      // Créer la demande
      const { data: requestData, error: requestError } = await supabase
        .from("subsidy_requests")
        .insert({
          sfd_id: values.sfd_id,
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
        setIsUploading(true);
        const documentUrls: string[] = [];
        
        try {
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
        } finally {
          setIsUploading(false);
        }
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
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
      });
    },
  });
  
  // Soumission du formulaire manuel
  const onSubmit = async (values: z.infer<typeof subsidyRequestSchema>) => {
    createSubsidyRequest.mutate(values);
  };
  
  // Gestion de l'import de données
  const handleImport = () => {
    try {
      // Vérifier que les données sont au format JSON valide
      const importedData = JSON.parse(importData);
      
      // Validation minimale des données importées
      if (!importedData.amount || !importedData.purpose || !importedData.sfd_id) {
        throw new Error("Données incomplètes. Veuillez vérifier le format du JSON.");
      }
      
      // Préremplir le formulaire avec les données importées
      form.setValue('amount', importedData.amount.toString());
      form.setValue('purpose', importedData.purpose);
      form.setValue('justification', importedData.justification || '');
      form.setValue('region', importedData.region || '');
      form.setValue('expected_impact', importedData.expected_impact || '');
      form.setValue('priority', importedData.priority || 'normal');
      form.setValue('sfd_id', importedData.sfd_id);
      
      // Basculer vers l'onglet du formulaire
      setActiveTab('form');
      
      toast({
        title: "Import réussi",
        description: "Les données ont été correctement importées dans le formulaire.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur d'import",
        description: `Impossible de traiter les données: ${error.message}`,
      });
    }
  };
  
  // Exemple de données d'export
  const exportExample = {
    amount: 5000000,
    purpose: "Financement de microcrédits agricoles",
    justification: "Cette demande vise à soutenir le développement de l'agriculture locale.",
    region: "Centre",
    expected_impact: "Amélioration des revenus de 500 agriculteurs.",
    priority: "normal",
    sfd_id: "id-de-la-sfd",
  };
  
  // Gestion du téléchargement de fichiers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="form">Formulaire manuel</TabsTrigger>
          <TabsTrigger value="import">Import / Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
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
              
              <FormField
                control={form.control}
                name="sfd_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SFD</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une SFD" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sfds.map((sfd) => (
                          <SelectItem key={sfd.id} value={sfd.id}>
                            {sfd.name} ({sfd.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <FormLabel>Montant demandé (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 5000000" {...field} />
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel>Documents justificatifs</FormLabel>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Ajouter des documents
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                    </div>
                    
                    {files.length > 0 ? (
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 border rounded-md"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center mr-2">
                                <span className="text-xs">
                                  {file.name.split('.').pop()?.toUpperCase()}
                                </span>
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">
                                  {file.name}
                                </p>
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
                          Aucun document ajouté. Formats acceptés: PDF, JPG, PNG, DOC, DOCX
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
                  disabled={createSubsidyRequest.isPending || isUploading}
                >
                  {(createSubsidyRequest.isPending || isUploading) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Soumettre la demande
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="import">
          <div className="space-y-6">
            <Alert className="bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle>Format de données standardisé</AlertTitle>
              <AlertDescription>
                Cette fonctionnalité permet d'importer ou d'exporter des demandes au format JSON standardisé
                conforme aux spécifications du MEREF.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Importer des données</h3>
                  <Textarea
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Collez ici les données JSON..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                  />
                  <Button 
                    onClick={handleImport}
                    className="mt-4 w-full"
                    disabled={!importData.trim()}
                  >
                    Importer dans le formulaire
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Exemple de format</h3>
                  <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[300px]">
                    <pre className="text-xs">
                      {JSON.stringify(exportExample, null, 2)}
                    </pre>
                  </div>
                  <Button 
                    onClick={() => {
                      setImportData(JSON.stringify(exportExample, null, 2));
                      toast({
                        title: "Format d'exemple chargé",
                        description: "L'exemple a été chargé dans la zone d'import."
                      });
                    }}
                    className="mt-4 w-full"
                    variant="outline"
                  >
                    Utiliser cet exemple
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('form')}
              >
                Revenir au formulaire
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
