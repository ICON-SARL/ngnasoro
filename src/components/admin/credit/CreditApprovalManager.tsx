
import React, { useState } from 'react';
import { useCreditApproval, CreditApplication } from '@/hooks/useCreditApproval';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter,
  CardHeader,
  CardTitle, 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, FileCheck, FileX, Filter, Search, PlusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export function CreditApprovalManager() {
  const { applications, isLoading, approveCredit, rejectCredit, createCreditApplication } = useCreditApproval();
  const [selectedApplication, setSelectedApplication] = useState<CreditApplication | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { isAdmin, isSfdAdmin } = useAuth();
  
  // Nouveaux états pour le formulaire de création
  const [newAmount, setNewAmount] = useState<string>('');
  const [newPurpose, setNewPurpose] = useState<string>('');

  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    await approveCredit.mutateAsync({
      applicationId: selectedApplication.id,
      comments: comments
    });
    
    setShowApproveDialog(false);
    setComments('');
    setSelectedApplication(null);
  };
  
  const handleReject = async () => {
    if (!selectedApplication) return;
    
    await rejectCredit.mutateAsync({
      applicationId: selectedApplication.id,
      reason: rejectionReason,
      comments: comments
    });
    
    setShowRejectDialog(false);
    setComments('');
    setRejectionReason('');
    setSelectedApplication(null);
  };
  
  const handleCreate = async () => {
    if (!newAmount || !newPurpose) return;
    
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    await createCreditApplication.mutateAsync({
      amount,
      purpose: newPurpose
    });
    
    setShowCreateDialog(false);
    setNewAmount('');
    setNewPurpose('');
  };
  
  // Filter applications based on search term and status filter
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.sfd_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = 
      statusFilter === 'all' || 
      app.status === statusFilter;
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par référence, SFD, objectif..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-60">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrer par statut" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvé</SelectItem>
              <SelectItem value="rejected">Rejeté</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Bouton de création pour les admins SFD */}
        {isSfdAdmin && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nouvelle demande
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Crédit</CardTitle>
          <CardDescription>
            {isAdmin 
              ? "Examinez et approuvez les demandes de crédit des SFDs" 
              : "Gérez vos demandes de crédit"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Chargement des demandes...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center p-8 bg-muted/20 rounded-md">
              <p className="text-muted-foreground">
                {isSfdAdmin 
                  ? "Aucune demande trouvée. Créez une nouvelle demande de crédit avec le bouton ci-dessus." 
                  : "Aucune demande trouvée"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>SFD</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Objet</TableHead>
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
                      <TableCell>{application.amount.toLocaleString('fr-FR')} FCFA</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div 
                            className={`h-2 w-2 rounded-full ${
                              application.score >= 80 ? 'bg-green-500' : 
                              application.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          />
                          {application.score}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={application.purpose}>
                        {application.purpose}
                      </TableCell>
                      <TableCell>
                        {format(new Date(application.created_at), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          application.status === 'approved' ? 'default' :
                          application.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {application.status === 'approved' ? 'Approuvé' :
                           application.status === 'rejected' ? 'Rejeté' : 'En attente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {application.status === 'pending' && isAdmin && (
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowApproveDialog(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="text-green-600"
                            >
                              <FileCheck className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowRejectDialog(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                            >
                              <FileX className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la demande de crédit</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'approuver la demande de crédit {selectedApplication?.reference}.
              Veuillez ajouter des commentaires si nécessaire.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Détails de la demande:</h4>
              <p><strong>SFD:</strong> {selectedApplication?.sfd_name}</p>
              <p><strong>Montant:</strong> {selectedApplication?.amount.toLocaleString('fr-FR')} FCFA</p>
              <p><strong>Objet:</strong> {selectedApplication?.purpose}</p>
              <p><strong>Score:</strong> {selectedApplication?.score}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="comments" className="text-sm font-medium">
                Commentaires (facultatif)
              </label>
              <Textarea
                id="comments"
                placeholder="Ajouter des remarques sur cette approbation..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleApprove} disabled={approveCredit.isPending}>
              {approveCredit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer l'approbation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la demande de crédit</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter la demande de crédit {selectedApplication?.reference}.
              Veuillez indiquer la raison du rejet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Détails de la demande:</h4>
              <p><strong>SFD:</strong> {selectedApplication?.sfd_name}</p>
              <p><strong>Montant:</strong> {selectedApplication?.amount.toLocaleString('fr-FR')} FCFA</p>
              <p><strong>Objet:</strong> {selectedApplication?.purpose}</p>
              <p><strong>Score:</strong> {selectedApplication?.score}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Motif du rejet <span className="text-red-500">*</span>
              </label>
              <Select value={rejectionReason} onValueChange={setRejectionReason} required>
                <SelectTrigger id="reason">
                  <SelectValue placeholder="Sélectionner un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score_insuffisant">Score de crédit insuffisant</SelectItem>
                  <SelectItem value="garanties_insuffisantes">Garanties insuffisantes</SelectItem>
                  <SelectItem value="documentation_incomplete">Documentation incomplète</SelectItem>
                  <SelectItem value="historique_défavorable">Historique de crédit défavorable</SelectItem>
                  <SelectItem value="autre">Autre motif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reject-comments" className="text-sm font-medium">
                Commentaires détaillés
              </label>
              <Textarea
                id="reject-comments"
                placeholder="Détaillez les raisons du rejet..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={rejectCredit.isPending || !rejectionReason}
            >
              {rejectCredit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Dialog pour les admins SFD */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle demande de crédit</DialogTitle>
            <DialogDescription>
              Créez une nouvelle demande de crédit pour votre SFD.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Montant (FCFA) <span className="text-red-500">*</span>
              </label>
              <Input
                id="amount"
                type="number"
                placeholder="Ex: 5000000"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="purpose" className="text-sm font-medium">
                Objet de la demande <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="purpose"
                placeholder="Décrivez l'objectif de cette demande de crédit..."
                value={newPurpose}
                onChange={(e) => setNewPurpose(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={createCreditApplication.isPending || !newAmount || !newPurpose}
            >
              {createCreditApplication.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Soumettre la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
