import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, FileText, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AdhesionRequest {
  id: string;
  user_id: string;
  sfd_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

interface ClientDocument {
  id: string;
  document_type: string;
  document_url: string;
  status: string;
  uploaded_at: string;
}

const ClientAdhesionManagementPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AdhesionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdhesionRequest | null>(null);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      const { data: userSfds } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user?.id || '');

      if (!userSfds || userSfds.length === 0) {
        setLoading(false);
        return;
      }

      const sfdIds = userSfds.map(us => us.sfd_id);

      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select('*')
        .in('sfd_id', sfdIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('uploaded_by', userId);

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleViewDetails = async (request: AdhesionRequest) => {
    setSelectedRequest(request);
    await fetchDocuments(request.user_id);
  };

  const handleApprove = async (request: AdhesionRequest) => {
    setProcessing(true);
    try {
      // 1. Créer le client SFD
      const { data: sfd } = await supabase
        .from('sfds')
        .select('code')
        .eq('id', request.sfd_id)
        .single();

      const { data: clientCodeData } = await supabase
        .rpc('generate_client_code', { sfd_code: sfd?.code || 'SFD' });

      const { data: newClient, error: clientError } = await supabase
        .from('sfd_clients')
        .insert({
          sfd_id: request.sfd_id,
          user_id: request.user_id,
          full_name: request.full_name,
          email: request.email,
          phone: request.phone,
          address: request.address,
          status: 'active',
          client_code: clientCodeData,
          kyc_level: 1,
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Créer les 3 comptes (opération, épargne, remboursement)
      const accountTypes = ['operation', 'epargne', 'remboursement'];
      for (const accountType of accountTypes) {
        await supabase
          .from('accounts')
          .insert({
            user_id: request.user_id,
            sfd_id: request.sfd_id,
            balance: 0,
            status: 'active',
            currency: 'FCFA',
          });
      }

      // 3. Upgrade rôle utilisateur de 'user' à 'client'
      await supabase
        .from('user_roles')
        .insert({
          user_id: request.user_id,
          role: 'client',
        });

      // 4. Mettre à jour la demande d'adhésion
      const { error: updateError } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // 5. Logger l'action
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: 'approve_client_adhesion',
          category: 'client_management',
          severity: 'info',
          status: 'success',
          details: {
            request_id: request.id,
            client_id: newClient.id,
            full_name: request.full_name,
          },
        });

      toast({
        title: 'Succès',
        description: 'Demande approuvée avec succès',
      });

      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver la demande',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('client_adhesion_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action: 'reject_client_adhesion',
          category: 'client_management',
          severity: 'info',
          status: 'success',
          details: {
            request_id: selectedRequest.id,
            full_name: selectedRequest.full_name,
            rejection_reason: rejectionReason,
          },
        });

      toast({
        title: 'Succès',
        description: 'Demande rejetée',
      });

      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter la demande',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          Demandes d'Adhésion Client
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérer les demandes d'adhésion des nouveaux clients
        </p>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucune demande d'adhésion</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{request.full_name}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {request.email && <p>Email: {request.email}</p>}
                      {request.phone && <p>Téléphone: {request.phone}</p>}
                      {request.address && <p>Adresse: {request.address}</p>}
                      <p>Demandé le: {new Date(request.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(request)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>
              Vérifiez les informations avant d'approuver ou rejeter
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Informations personnelles</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Nom:</strong> {selectedRequest.full_name}</p>
                  <p><strong>Email:</strong> {selectedRequest.email || 'N/A'}</p>
                  <p><strong>Téléphone:</strong> {selectedRequest.phone || 'N/A'}</p>
                  <p><strong>Adresse:</strong> {selectedRequest.address || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Documents KYC</h4>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun document téléchargé</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{doc.document_type}</span>
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() => window.open(doc.document_url, '_blank')}
                        >
                          Voir
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(true);
              }}
              disabled={processing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeter
            </Button>
            <Button
              onClick={() => selectedRequest && handleApprove(selectedRequest)}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande</DialogTitle>
            <DialogDescription>
              Veuillez fournir une raison pour le rejet
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection_reason">Raison du rejet</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi cette demande est rejetée..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason || processing}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientAdhesionManagementPage;
