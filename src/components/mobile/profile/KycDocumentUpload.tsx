
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/sfd/FileUpload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Shield, FileText, Check, Upload } from 'lucide-react';

type DocumentType = 'id_card_front' | 'id_card_back' | 'proof_of_address';

interface KycDocumentUploadProps {
  onUploadComplete?: () => void;
}

const KycDocumentUpload: React.FC<KycDocumentUploadProps> = ({ onUploadComplete }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = async (file: File, documentType: DocumentType) => {
    if (!user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour téléverser des documents",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. First upload the file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc_documents')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // 2. Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('kyc_documents')
        .getPublicUrl(fileName);
        
      // 3. Record the document in the database (client_documents table)
      // First get the client_id for this user
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (clientError) {
        console.error('Error finding client:', clientError);
      }
      
      const { error } = await supabase
        .from('client_documents')
        .insert({
          client_id: clientData?.id || user.id,
          document_type: documentType as 'identity' | 'proof_of_address' | 'bank_statement' | 'other',
          document_url: publicUrl,
          uploaded_by: user.id
        });
        
      if (error) throw error;
      
      toast({
        title: "Document téléversé",
        description: "Votre document a été téléversé avec succès",
      });
      
      if (onUploadComplete) onUploadComplete();
      
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur de téléversement",
        description: error.message || "Une erreur est survenue lors du téléversement du document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const documentTypes = [
    {
      type: 'id_card_front' as DocumentType,
      label: "Carte d'identité (Recto)",
      description: "La face avant de votre carte d'identité nationale"
    },
    {
      type: 'id_card_back' as DocumentType,
      label: "Carte d'identité (Verso)", 
      description: "La face arrière de votre carte d'identité nationale"
    },
    {
      type: 'proof_of_address' as DocumentType, 
      label: "Justificatif de domicile",
      description: "Un document récent prouvant votre adresse actuelle"
    }
  ];
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Vérification d'identité (KYC)</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Pour compléter la vérification de votre compte, veuillez téléverser les documents suivants:
          </p>
          
          {documentTypes.map((doc) => (
            <div key={doc.type} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-medium">{doc.label}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{doc.description}</p>
              
              <FileUpload
                onUpload={(file) => handleUpload(file, doc.type)}
                accept=".jpg,.jpeg,.png,.pdf"
                label={`Téléverser ${doc.label}`}
                maxSize={5}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default KycDocumentUpload;
