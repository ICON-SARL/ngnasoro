import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Check, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { KycVerificationDocument } from '@/types/kyc';

interface KycDocumentListProps {
  refreshKey?: number;
}

const KycDocumentList: React.FC<KycDocumentListProps> = ({ refreshKey = 0 }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<KycVerificationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('verification_documents')
          .select('id, document_type, document_url, verification_status, created_at, verified_at, verification_notes')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .returns<KycVerificationDocument[]>();
          
        if (error) throw error;
        if (data) {
          setDocuments(data);
        }
      } catch (error) {
        console.error('Error fetching KYC documents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user?.id, refreshKey]);
  
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
  
  const getStatusBadge = (status: 'pending' | 'verified' | 'rejected') => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-50 text-green-600 border-green-200">
          <Check className="h-3 w-3 mr-1" />
          Vérifié
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Rejeté
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>;
    }
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">
      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
      <p>Chargement des documents...</p>
    </div>;
  }
  
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-medium text-lg mb-1">Aucun document</h3>
          <p className="text-muted-foreground text-sm">
            Vous n'avez pas encore téléversé de documents pour la vérification KYC.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div key={doc.id} className="border rounded-lg bg-background overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-primary" />
                <span className="font-medium">{getDocumentTypeLabel(doc.document_type)}</span>
              </div>
              {getStatusBadge(doc.verification_status)}
            </div>
            
            <div className="text-xs text-muted-foreground mb-3">
              Soumis le {format(new Date(doc.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </div>
            
            {doc.verification_status === 'verified' && doc.verified_at && (
              <div className="text-xs text-green-600 mb-3">
                <Check className="h-3 w-3 inline mr-1" />
                Vérifié le {format(new Date(doc.verified_at), 'dd MMMM yyyy', { locale: fr })}
              </div>
            )}
            
            {doc.verification_status === 'rejected' && doc.verification_notes && (
              <div className="text-xs text-red-600 mb-3">
                Motif: {doc.verification_notes}
              </div>
            )}
            
            <div className="flex justify-end">
              <a 
                href={doc.document_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs flex items-center text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Voir le document
              </a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KycDocumentList;
