
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientCodeSearch } from './ClientCodeSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, FileX, FileClock } from 'lucide-react';
import { KycVerificationDocument } from '@/types/kyc';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const KycVerificationAdmin = () => {
  const [client, setClient] = useState<any>(null);
  const [documents, setDocuments] = useState<KycVerificationDocument[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleClientFound = async (clientData: any) => {
    setClient(clientData);
    await fetchDocuments(clientData.client_code);
  };
  
  const fetchDocuments = async (clientCode: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('client_code', clientCode)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setDocuments(data as unknown as KycVerificationDocument[] || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les documents KYC",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyDocument = async (document: KycVerificationDocument, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('verification_documents')
        .update({
          verification_status: approve ? 'verified' : 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user?.id,
          verification_notes: approve ? null : 'Document non conforme'
        })
        .eq('id', document.id);
        
      if (error) throw error;
      
      toast({
        title: approve ? "Document approuvé" : "Document rejeté",
        description: `Le document a été ${approve ? 'approuvé' : 'rejeté'} avec succès`,
        variant: approve ? "default" : "destructive"
      });
      
      // Refresh documents
      if (client?.client_code) {
        await fetchDocuments(client.client_code);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du document",
        variant: "destructive"
      });
    }
  };
  
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'id_card_front':
        return "Carte d'identité (Recto)";
      case 'id_card_back':
        return "Carte d'identité (Verso)";
      case 'proof_of_address':
        return "Justificatif de domicile";
      case 'selfie':
        return "Photo du visage (Selfie)";
      default:
        return type;
    }
  };
  
  // Filter documents based on active tab
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'all') return true;
    return doc.verification_status === activeTab;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vérification KYC</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ClientCodeSearch onClientFound={handleClientFound} />
          
          {client && (
            <div className="p-4 border rounded-md bg-blue-50">
              <p className="font-medium">Client: {client.full_name}</p>
              <p className="text-sm">{client.email || 'Email non disponible'}</p>
              {client.phone && <p className="text-sm">Téléphone: {client.phone}</p>}
            </div>
          )}
          
          {client && (
            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <FileClock className="h-4 w-4" />
                  En attente
                </TabsTrigger>
                <TabsTrigger value="verified" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Vérifiés
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-2">
                  <FileX className="h-4 w-4" />
                  Rejetés
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="mt-4">
                {isLoading ? (
                  <div className="text-center p-4">Chargement des documents...</div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">Aucun document en attente</div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="border rounded-md p-4">
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{getDocumentTypeLabel(doc.document_type)}</p>
                          <span className="text-sm text-blue-500">En attente</span>
                        </div>
                        <div className="mb-3">
                          <a 
                            href={doc.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Voir le document
                          </a>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleVerifyDocument(doc, true)}
                            className="flex-1"
                          >
                            Approuver
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleVerifyDocument(doc, false)}
                            className="flex-1"
                          >
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="verified" className="mt-4">
                {isLoading ? (
                  <div className="text-center p-4">Chargement des documents...</div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">Aucun document vérifié</div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="border rounded-md p-4">
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{getDocumentTypeLabel(doc.document_type)}</p>
                          <span className="text-sm text-green-500">Vérifié</span>
                        </div>
                        <div>
                          <a 
                            href={doc.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Voir le document
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="rejected" className="mt-4">
                {isLoading ? (
                  <div className="text-center p-4">Chargement des documents...</div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center p-4 text-gray-500">Aucun document rejeté</div>
                ) : (
                  <div className="space-y-4">
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="border rounded-md p-4">
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">{getDocumentTypeLabel(doc.document_type)}</p>
                          <span className="text-sm text-red-500">Rejeté</span>
                        </div>
                        <div>
                          <a 
                            href={doc.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Voir le document
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KycVerificationAdmin;
