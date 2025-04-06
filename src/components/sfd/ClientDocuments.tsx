
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Image,
  Check,
  XCircle,
  Upload,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { sfdClientApi } from '@/utils/sfdClientApi';
import { ClientDocument } from '@/types/sfdClients';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';

interface ClientDocumentsProps {
  clientId: string;
}

const ClientDocuments = ({ clientId }: ClientDocumentsProps) => {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const docs = await sfdClientApi.getClientDocuments(clientId);
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les documents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [clientId, toast]);
  
  const verifyDocument = useMutation({
    mutationFn: async (documentId: string) => {
      if (!user?.id) throw new Error("Utilisateur non authentifié");
      return sfdClientApi.verifyClientDocument(documentId, user.id);
    },
    onSuccess: (updatedDoc) => {
      setDocuments(prev => 
        prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc)
      );
      toast({
        title: "Document vérifié",
        description: "Le document a été marqué comme vérifié",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de vérifier le document",
        variant: "destructive",
      });
    }
  });
  
  const getDocumentTypeLabel = (type: string) => {
    switch(type) {
      case 'id_card':
        return "Carte d'identité";
      case 'passport':
        return "Passeport";
      case 'proof_of_address':
        return "Justificatif de domicile";
      case 'selfie':
        return "Photo personnelle";
      default:
        return type;
    }
  };
  
  if (isLoading) {
    return <div className="py-8 text-center">Chargement des documents...</div>;
  }
  
  if (documents.length === 0) {
    return (
      <div className="py-8 text-center">
        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Aucun document n'a été téléchargé pour ce client.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="overflow-hidden">
            <div className="h-32 bg-gray-100 relative flex items-center justify-center">
              {doc.document_url.toLowerCase().includes('.jpg') || 
               doc.document_url.toLowerCase().includes('.jpeg') || 
               doc.document_url.toLowerCase().includes('.png') ? (
                <img 
                  src={doc.document_url} 
                  alt={getDocumentTypeLabel(doc.document_type)} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <FileText className="h-12 w-12 text-gray-400" />
              )}
              
              {doc.verified && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{getDocumentTypeLabel(doc.document_type)}</h4>
                {doc.verified ? (
                  <Badge className="bg-green-50 text-green-700">Vérifié</Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700">Non vérifié</Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-500 flex items-center mb-2">
                <Calendar className="h-3 w-3 mr-1" />
                Téléchargé le {new Date(doc.uploaded_at).toLocaleDateString()}
              </div>
              
              <div className="flex justify-between mt-2">
                <a
                  href={doc.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Voir le document
                </a>
                
                {!doc.verified && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs h-7 px-2"
                    onClick={() => verifyDocument.mutate(doc.id)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Vérifier
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientDocuments;
