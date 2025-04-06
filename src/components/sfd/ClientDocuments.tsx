
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ClientDocument } from '@/types/sfdClients';
import { useToast } from '@/hooks/use-toast';

interface ClientDocumentsProps {
  clientId: string;
}

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ clientId }) => {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId);
          
        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les documents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [clientId, toast]);
  
  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'id_card': return 'Carte d\'identité';
      case 'passport': return 'Passeport';
      case 'proof_of_address': return 'Justificatif de domicile';
      case 'selfie': return 'Photo d\'identité';
      case 'other': return 'Autre document';
      default: return type;
    }
  };
  
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p>Chargement des documents...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 py-4">
      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium">Aucun document</h3>
            <p className="text-muted-foreground mt-1">
              Ce client n'a pas encore ajouté de documents
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <FileText className="h-10 w-10 p-2 bg-blue-50 rounded-md text-blue-600 mr-4" />
                    <div>
                      <h3 className="font-medium">{getDocumentTypeName(doc.document_type)}</h3>
                      <p className="text-sm text-gray-500">
                        Ajouté le {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    {doc.verified ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Vérifié
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 flex items-center">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        À vérifier
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <a 
                    href={doc.document_url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Voir le document
                  </a>
                  
                  {!doc.verified && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8">
                        <XCircle className="h-4 w-4 mr-1 text-red-500" />
                        Rejeter
                      </Button>
                      <Button size="sm" className="h-8">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Valider
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDocuments;
