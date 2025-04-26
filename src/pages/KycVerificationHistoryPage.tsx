
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, FileText, Check, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import KycVerificationStatus from '@/components/mobile/profile/KycVerificationStatus';

const KycVerificationHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('kyc_verification_documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error('Error fetching KYC documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user?.id]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'id_card_front':
        return "Carte d'identité (Recto)";
      case 'id_card_back':
        return "Carte d'identité (Verso)";
      case 'proof_of_address':
        return "Justificatif de domicile";
      default:
        return type;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="h-4 w-4 text-green-600" />
        </div>;
      case 'rejected':
        return <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-red-600" />
        </div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Clock className="h-4 w-4 text-blue-600" />
        </div>;
    }
  };
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={handleGoBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Historique de vérification KYC</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              Statut KYC
            </CardTitle>
            <KycVerificationStatus />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            La vérification KYC (Know Your Customer) est requise pour accéder à tous les services financiers. 
            Cette page présente l'historique de vos soumissions de documents et leur statut de vérification.
          </p>
        </CardContent>
      </Card>
      
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Documents soumis
      </h2>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement de l'historique...</p>
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="font-medium text-lg mb-1">Aucun document</h3>
            <p className="text-muted-foreground text-sm">
              Vous n'avez pas encore téléversé de documents pour la vérification KYC.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(doc.verification_status)}
                  <div className="flex-1">
                    <div className="font-medium">{getDocumentTypeLabel(doc.document_type)}</div>
                    <div className="text-xs text-muted-foreground">
                      Soumis le {format(new Date(doc.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </div>
                    
                    {doc.verification_status === 'verified' && doc.verified_at && (
                      <div className="text-xs text-green-600 mt-1">
                        Vérifié le {format(new Date(doc.verified_at), 'dd MMMM yyyy', { locale: fr })}
                      </div>
                    )}
                    
                    {doc.verification_status === 'rejected' && doc.rejection_reason && (
                      <div className="text-xs text-red-600 mt-1">
                        Motif de rejet: {doc.rejection_reason}
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <a 
                        href={doc.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs flex items-center text-primary hover:underline"
                      >
                        Voir le document
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <Button onClick={handleGoBack} className="w-full">
          Retour au profil
        </Button>
      </div>
    </div>
  );
};

export default KycVerificationHistoryPage;
