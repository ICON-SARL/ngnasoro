import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  client_id: string;
  document_type: string;
  document_url: string;
  status: string;
  verified: boolean;
  uploaded_at: string;
  sfd_clients: {
    full_name: string;
    client_code: string;
  };
}

export const ClientDocumentsVerification = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingDocuments();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('document-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'client_documents',
          filter: 'status=eq.pending'
        },
        (payload) => {
          toast({
            title: 'Nouveau document à vérifier',
            description: `Un client a uploadé un document`,
          });
          fetchPendingDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select(`
          *,
          sfd_clients!inner(
            full_name,
            client_code,
            sfd_id
          )
        `)
        .eq('status', 'pending')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (docId: string, clientId: string, approved: boolean) => {
    setProcessing(docId);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('client_documents')
        .update({
          verified: approved,
          status: approved ? 'verified' : 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: approved ? 'Document approuvé' : 'Document rejeté',
        description: approved 
          ? 'Le niveau KYC du client sera recalculé automatiquement' 
          : 'Le client pourra uploader un nouveau document',
      });

      // Si approuvé, trigger recalcul KYC
      if (approved) {
        const { error: functionError } = await supabase.functions.invoke('recalculate-kyc-level', {
          body: { clientId }
        });

        if (functionError) {
          console.error('Error recalculating KYC:', functionError);
        }
      }

      // Refresh la liste
      fetchPendingDocuments();
    } catch (error) {
      console.error('Error verifying document:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter le document',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      identity: 'Pièce d\'identité',
      proof_of_address: 'Justificatif de domicile',
      bank_statement: 'Justificatif de revenu',
      other: 'Autre document'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Documents en Attente de Vérification</h2>
        <Badge variant="outline">{documents.length} document(s)</Badge>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucun document en attente de vérification</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map(doc => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{doc.sfd_clients.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Code: {doc.sfd_clients.client_code}
                    </p>
                  </div>
                  <Badge variant="secondary">{getDocumentTypeLabel(doc.document_type)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Uploadé le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(doc.document_url, '_blank')}
                    disabled={processing === doc.id}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir Document
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleVerifyDocument(doc.id, doc.client_id, true)}
                    disabled={processing === doc.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processing === doc.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleVerifyDocument(doc.id, doc.client_id, false)}
                    disabled={processing === doc.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
