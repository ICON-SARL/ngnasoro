import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, X, AlertTriangle, FileText, Search, ArrowUpDown, Star } from 'lucide-react';
import { useCreditApplications } from '@/hooks/useCreditApplications';
import { Input } from '@/components/ui/input';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';

export const CreditApplicationList = () => {
  const { applications, isLoading, approveApplication, rejectApplication } = useCreditApplications();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const { sendNotification } = useAdminCommunication();

  const filteredApplications = applications?.filter(app => 
    app.sfd_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.reference.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const rejectionReasons = [
    'dossier_incomplet', 
    'risque_eleve', 
    'historique_negatif', 
    'capacite_remboursement_insuffisante',
    'documents_manquants',
    'informations_incorrectes',
    'autre'
  ];

  const getRejectionReasonLabel = (code: string) => {
    switch(code) {
      case 'dossier_incomplet': return 'Dossier incomplet';
      case 'risque_eleve': return 'Risque élevé';
      case 'historique_negatif': return 'Historique négatif';
      case 'capacite_remboursement_insuffisante': return 'Capacité de remboursement insuffisante';
      case 'documents_manquants': return 'Documents manquants';
      case 'informations_incorrectes': return 'Informations incorrectes';
      case 'autre': return 'Autre raison';
      default: return code;
    }
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    try {
      await approveApplication.mutateAsync({
        applicationId: selectedApplication.id,
        comments: additionalComments
      });
      
      await sendNotification({
        title: "Demande de crédit approuvée",
        message: `Votre demande de crédit (Réf: ${selectedApplication.reference}) a été approuvée pour un montant de ${selectedApplication.amount.toLocaleString()} FCFA.`,
        type: 'info',
        recipient_id: selectedApplication.sfd_id,
        action_link: '/sfd/credit-applications'
      });
      
      toast({
        title: "Demande approuvée",
        description: `La demande de crédit de ${selectedApplication.sfd_name} a été approuvée`,
      });
      
      setIsApprovalDialogOpen(false);
      setSelectedApplication(null);
      setAdditionalComments('');
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason) return;
    
    try {
      await rejectApplication.mutateAsync({
        applicationId: selectedApplication.id,
        rejectionReason,
        comments: additionalComments
      });
      
      await sendNotification({
        title: "Demande de crédit rejetée",
        message: `Votre demande de crédit (Réf: ${selectedApplication.reference}) a été rejetée pour la raison suivante: ${getRejectionReasonLabel(rejectionReason)}.`,
        type: 'warning',
        recipient_id: selectedApplication.sfd_id,
        action_link: '/sfd/credit-applications'
      });
      
      toast({
        title: "Demande rejetée",
        description: `La demande de crédit de ${selectedApplication.sfd_name} a été rejetée`,
      });
      
      setIsRejectionDialogOpen(false);
      setSelectedApplication(null);
      setRejectionReason('');
      setAdditionalComments('');
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const renderScoreBadge = (score: number) => {
    if (score >= 80) {
      return <Badge className="bg-green-100 text-green-800">Score: {score}</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-blue-100 text-blue-800">Score: {score}</Badge>;
    } else if (score >= 40) {
      return <Badge className="bg-amber-100 text-amber-800">Score: {score}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Score: {score}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0D6A51]" />
            Demandes de Crédit
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Trier
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Filtrer par score
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="h-8 w-8 mx-auto animate-spin rounded-full border-b-2 border-[#0D6A51]"></div>
              <p className="mt-2 text-muted-foreground">Chargement des demandes...</p>
            </div>
          ) : filteredApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>SFD</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.reference}</TableCell>
                    <TableCell>{application.sfd_name}</TableCell>
                    <TableCell>{application.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>{application.purpose}</TableCell>
                    <TableCell>{renderScoreBadge(application.score)}</TableCell>
                    <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {application.status === 'pending' && (
                        <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
                      )}
                      {application.status === 'approved' && (
                        <Badge className="bg-green-100 text-green-800">Approuvée</Badge>
                      )}
                      {application.status === 'rejected' && (
                        <Badge className="bg-red-100 text-red-800">Rejetée</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {application.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setSelectedApplication(application);
                              setIsApprovalDialogOpen(true);
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedApplication(application);
                              setIsRejectionDialogOpen(true);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                      {(application.status === 'approved' || application.status === 'rejected') && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Aucune demande de crédit trouvée.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la demande de crédit</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="font-medium text-blue-900">{selectedApplication.sfd_name}</p>
                <p className="text-blue-800">Montant: {selectedApplication.amount.toLocaleString()} FCFA</p>
                <p className="text-blue-800">Objet: {selectedApplication.purpose}</p>
                <p className="text-blue-800">Score: {selectedApplication.score}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Commentaires (optionnel)</label>
                <Textarea
                  placeholder="Ajouter des commentaires pour cette approbation..."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-1" />
              Confirmer l'approbation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande de crédit</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-md">
                <p className="font-medium text-red-900">{selectedApplication.sfd_name}</p>
                <p className="text-red-800">Montant: {selectedApplication.amount.toLocaleString()} FCFA</p>
                <p className="text-red-800">Objet: {selectedApplication.purpose}</p>
                <p className="text-red-800">Score: {selectedApplication.score}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Motif de rejet <span className="text-red-500">*</span></label>
                <Select
                  value={rejectionReason}
                  onValueChange={setRejectionReason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un motif de rejet" />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectionReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {getRejectionReasonLabel(reason)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Commentaires supplémentaires</label>
                <Textarea
                  placeholder="Détaillez la raison du rejet..."
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleReject} 
              className="bg-red-600 hover:bg-red-700" 
              disabled={!rejectionReason}
            >
              <X className="h-4 w-4 mr-1" />
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
