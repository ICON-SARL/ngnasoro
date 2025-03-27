
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

export const CreditApplicationList = () => {
  const { applications, isLoading, approveApplication, rejectApplication } = useCreditApplications();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');

  // Filter applications by search query
  const filteredApplications = applications?.filter(app => 
    app.sfd_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.reference.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Predefined rejection reasons
  const rejectionReasons = [
    'dossier_incomplet', 
    'risque_eleve', 
    'historique_negatif', 
    'capacite_remboursement_insuffisante',
    'documents_manquants',
    'informations_incorrectes',
    'autre'
  ];

  // Get readable rejection reason label
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

  // Handle application approval
  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    try {
      // Fix: Use .mutate() method instead of calling the mutation object directly
      approveApplication.mutate({ 
        applicationId: selectedApplication.id,
        comments: additionalComments
      });
      
      toast({
        title: "Demande approuvée",
        description: `La demande de ${selectedApplication.sfd_name} a été approuvée avec succès`,
      });
      
      setIsApprovalDialogOpen(false);
      setSelectedApplication(null);
      setAdditionalComments('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation",
        variant: "destructive",
      });
    }
  };

  // Handle application rejection
  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason) return;
    
    try {
      // Fix: Use .mutate() method instead of calling the mutation object directly
      rejectApplication.mutate({ 
        applicationId: selectedApplication.id,
        rejectionReason,
        comments: additionalComments
      });
      
      toast({
        title: "Demande rejetée",
        description: `La demande de ${selectedApplication.sfd_name} a été rejetée`,
      });
      
      setIsRejectionDialogOpen(false);
      setSelectedApplication(null);
      setRejectionReason('');
      setAdditionalComments('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet",
        variant: "destructive",
      });
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejetée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Demandes de Crédit</span>
          <div className="flex items-center space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher une SFD ou référence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Trier
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Référence</TableHead>
              <TableHead>SFD</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Envoyée le</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.reference}</TableCell>
                  <TableCell>{app.sfd_name}</TableCell>
                  <TableCell>{new Intl.NumberFormat('fr-FR').format(app.amount)} FCFA</TableCell>
                  <TableCell>{new Date(app.created_at).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                        app.score >= 70 ? 'bg-green-100 text-green-700' : 
                        app.score >= 50 ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.score}
                      </div>
                      <Star 
                        className={
                          app.score >= 70 ? 'text-green-500 h-4 w-4' : 
                          app.score >= 50 ? 'text-amber-500 h-4 w-4' : 
                          'text-red-500 h-4 w-4'
                        } 
                        fill="currentColor" 
                      />
                    </div>
                  </TableCell>
                  <TableCell>{renderStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center space-x-1">
                      {app.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedApplication(app);
                              setIsApprovalDialogOpen(true);
                            }}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4 mr-1" /> Approuver
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setSelectedApplication(app);
                              setIsRejectionDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" /> Rejeter
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-1" /> Détails
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  Aucune demande de crédit trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Approval Dialog */}
        <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approuver la demande de crédit</DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SFD:</span>
                    <span className="font-medium">{selectedApplication.sfd_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Référence:</span>
                    <span className="font-medium">{selectedApplication.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(selectedApplication.amount)} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className={`font-medium ${
                      selectedApplication.score >= 70 ? 'text-green-600' : 
                      selectedApplication.score >= 50 ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>{selectedApplication.score}/100</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Commentaires additionnels (optionnel)
                  </label>
                  <Textarea
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="Ajouter des notes ou des commentaires à cette approbation..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-1" />
                    Confirmer l'approbation
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter la demande de crédit</DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SFD:</span>
                    <span className="font-medium">{selectedApplication.sfd_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Référence:</span>
                    <span className="font-medium">{selectedApplication.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Montant:</span>
                    <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(selectedApplication.amount)} FCFA</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Motif de rejet <span className="text-red-500">*</span>
                  </label>
                  <Select value={rejectionReason} onValueChange={setRejectionReason} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un motif" />
                    </SelectTrigger>
                    <SelectContent>
                      {rejectionReasons.map(reason => (
                        <SelectItem key={reason} value={reason}>
                          {getRejectionReasonLabel(reason)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <label className="text-sm font-medium pt-2">
                    Commentaires additionnels
                  </label>
                  <Textarea
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="Détaillez la raison du rejet..."
                    rows={3}
                  />

                  <div className="flex items-start p-3 bg-amber-50 rounded-lg mt-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Important</p>
                      <p className="text-amber-700">
                        Le rejet sera communiqué à la SFD avec le motif sélectionné. 
                        Assurez-vous que les commentaires fournissent suffisamment d'informations.
                      </p>
                    </div>
                  </div>
                </div>

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
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
