
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { validateClientCode, formatClientCode } from '@/utils/clientCodeUtils';
import { ClientAdhesionRequest } from '@/types/adhesionRequests';

const documentTypes = [
  { value: 'id_card_front', label: "Carte d'identité (Recto)" },
  { value: 'id_card_back', label: "Carte d'identité (Verso)" },
  { value: 'proof_of_address', label: "Justificatif de domicile" },
  { value: 'selfie', label: "Photo du visage (Selfie)" },
  { value: 'other', label: "Autre document" }
];

interface KycDocumentUploadByCodeProps {
  onUploadComplete?: () => void;
}

const KycDocumentUploadByCode: React.FC<KycDocumentUploadByCodeProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [clientCode, setClientCode] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [clientFound, setClientFound] = useState<boolean | null>(null);
  const [clientData, setClientData] = useState<any | null>(null);
  const { toast } = useToast();

  const handleVerifyClientCode = async () => {
    if (!clientCode.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez entrer un code client",
        variant: "destructive"
      });
      return;
    }

    const formattedCode = formatClientCode(clientCode);

    if (!validateClientCode(formattedCode)) {
      toast({
        title: "Format invalide",
        description: "Le code client doit avoir le format SFD-XXXXXX-0000",
        variant: "destructive"
      });
      setClientFound(false);
      return;
    }

    try {
      // Check if client exists with this code
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('client_code', formattedCode)
        .single();

      if (profileError) {
        // Si aucun profil trouvé
        toast({
          title: "Client non trouvé",
          description: "Aucun client trouvé avec ce code",
          variant: "destructive"
        });
        setClientFound(false);
        setClientData(null);
        return;
      }

      // Vérifier si le client a une demande d'adhésion
      const { data: adhesionData, error: adhesionError } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .eq('user_id', profileData.id)
        .maybeSingle();

      if (!adhesionError && adhesionData) {
        // Une demande d'adhésion existe
        setClientData({
          ...profileData,
          ...adhesionData,
          email: profileData.email || adhesionData.email
        });
        setClientFound(true);
        toast({
          title: "Client trouvé",
          description: `Demande d'adhésion trouvée pour ${profileData.full_name || adhesionData.full_name}`
        });
        return;
      }

      // Vérifier si l'utilisateur est un client SFD
      const { data: sfdClientData, error: sfdClientError } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('user_id', profileData.id)
        .single();

      if (!sfdClientError && sfdClientData) {
        // Client SFD existe
        setClientData(sfdClientData);
        setClientFound(true);
        toast({
          title: "Client SFD trouvé",
          description: `Client ${sfdClientData.full_name} trouvé`
        });
        return;
      }

      // Si on arrive ici, l'utilisateur existe mais n'a pas de demande d'adhésion ou n'est pas client SFD
      setClientData({
        ...profileData,
        email: profileData.full_name // profiles table doesn't have email, use full_name as identifier
      });
      setClientFound(true);
      toast({
        title: "Utilisateur trouvé",
        description: `Utilisateur ${profileData.full_name} trouvé`
      });

    } catch (error) {
      console.error('Error verifying client code:', error);
      toast({
        title: "Erreur de vérification",
        description: "Une erreur est survenue lors de la vérification du code",
        variant: "destructive"
      });
      setClientFound(false);
      setClientData(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !documentType || !clientData) {
      toast({
        title: "Données requises",
        description: "Veuillez sélectionner un type de document et un fichier",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${documentType}.${fileExt}`;
      const filePath = `kyc-documents/${clientData.id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase
        .storage
        .from('client-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL for the file
      const { data: urlData } = supabase
        .storage
        .from('client-documents')
        .getPublicUrl(filePath);

      if (!urlData) throw new Error("Could not get URL for uploaded file");

      // Add document to client_documents table
      const { error: docError } = await supabase
        .from('client_documents')
        .insert({
          client_id: clientData.id,
          document_type: documentType as 'identity' | 'proof_of_address' | 'bank_statement' | 'other',
          document_url: urlData.publicUrl,
          uploaded_by: clientData.user_id || clientData.id
        });

      if (docError) throw docError;

      toast({
        title: "Document téléversé",
        description: "Le document a été téléversé avec succès et est en attente de vérification",
      });

      setFile(null);
      setDocumentType('');
      
      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur de téléversement",
        description: error.message || "Une erreur est survenue lors du téléversement du document",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client code verification section */}
      <div className="space-y-3">
        <h3 className="font-medium">1. Rechercher le client par code</h3>
        <div className="flex gap-2">
          <Input 
            placeholder="Entrez le code client (ex: SFD-ABC123-4567)"
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleVerifyClientCode}
            type="button"
            variant="outline"
          >
            Vérifier
          </Button>
        </div>
        
        {clientFound === false && (
          <p className="text-sm text-red-500">
            Client non trouvé. Veuillez vérifier le code et réessayer.
          </p>
        )}
        
        {clientFound === true && clientData && (
          <div className="p-3 border rounded-md bg-green-50">
            <p className="text-sm font-medium">Client trouvé: {clientData.full_name || 'Utilisateur'}</p>
            {clientData.phone && <p className="text-xs text-gray-600">Téléphone: {clientData.phone}</p>}
          </div>
        )}
      </div>
      
      {/* Document upload section - only show if client is found */}
      {clientFound === true && clientData && (
        <>
          <div className="space-y-3">
            <h3 className="font-medium">2. Sélectionner le type de document</h3>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type de document" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-medium">3. Téléverser le document</h3>
            <div className="border-2 border-dashed rounded-md p-4 text-center">
              <Label htmlFor="document-file" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 mb-1">
                  {file ? file.name : "Cliquez pour sélectionner un fichier"}
                </span>
                <span className="text-xs text-gray-500">
                  JPG, PNG ou PDF, 10MB maximum
                </span>
              </Label>
              <Input
                id="document-file"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleUpload} 
            disabled={!file || !documentType || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Téléversement en cours...
              </>
            ) : (
              <>Téléverser le document</>
            )}
          </Button>
        </>
      )}
    </div>
  );
};

export default KycDocumentUploadByCode;
