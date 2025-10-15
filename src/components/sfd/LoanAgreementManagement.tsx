import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loan } from '@/types/sfdClients';
import { FileText, Check, X, CreditCard, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AuditLogCategory, AuditLogSeverity, logAuditEvent } from '@/utils/audit';

interface LoanAgreementManagementProps {
  onRefresh?: () => void;
}

export function LoanAgreementManagement({ onRefresh }: LoanAgreementManagementProps) {
  const [activeTab, setActiveTab] = useState('pending');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | 'disburse' | null>(null);
  const [actionReason, setActionReason] = useState('');
  
  const { activeSfdId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (activeSfdId) {
      fetchLoans();
    }
  }, [activeSfdId]);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, statusFilter, activeTab]);

  const fetchLoans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          sfd_clients (
            full_name,
            email,
            phone
          )
        `)
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to ensure it conforms to the Loan type
      const processedLoans = data.map(loan => {
        return {
          ...loan,
          client_name: loan.sfd_clients?.full_name || 'Client #' + loan.client_id.substring(0, 4),
          status: loan.status || 'pending',
          reference: loan.id.substring(0, 8)
        } as Loan;
      });

      setLoans(processedLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prêts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = [...loans];

    // Filter by tab (status group)
    if (activeTab === 'pending') {
      filtered = filtered.filter(loan => loan.status === 'pending');
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(loan => loan.status === 'approved' || loan.status === 'disbursed');
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(loan => loan.status === 'rejected');
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(loan => 
        loan.client_name?.toLowerCase().includes(term) ||
        loan.reference?.toLowerCase().includes(term) ||
        loan.purpose.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }

    setFilteredLoans(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const handleViewLoan = (loan: Loan) => {
    // Cast the loan to ensure status is compatible
    const typedLoan: Loan = {
      ...loan,
      status: loan.status as Loan['status']
    };
    setSelectedLoan(typedLoan);
    setIsViewDialogOpen(true);
  };

  const openConfirmDialog = (loan: Loan, action: 'approve' | 'reject' | 'disburse') => {
    // Cast the loan to ensure status is compatible
    const typedLoan: Loan = {
      ...loan,
      status: loan.status as Loan['status']
    };
    setSelectedLoan(typedLoan);
    setConfirmAction(action);
    setActionReason('');
    setIsConfirmDialogOpen(true);
  };

  const handleApproveLoan = async (loan: Loan) => {
    // Cast the loan to ensure status is compatible
    const typedLoan: Loan = {
      ...loan,
      status: loan.status as Loan['status']
    };
    try {
      const { error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'current_user', // Replace with actual user ID
          notes: actionReason || null
        })
        .eq('id', typedLoan.id);

      if (error) throw error;

      await logAuditEvent(
        `Loan ${typedLoan.reference} approved`,
        AuditLogCategory.LOAN,
        AuditLogSeverity.INFO,
        { loanId: typedLoan.id, reason: actionReason }
      );

      toast({
        title: 'Prêt approuvé',
        description: 'Le prêt a été approuvé avec succès',
      });

      fetchLoans();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error approving loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'approuver le prêt',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleRejectLoan = async (loan: Loan) => {
    // Cast the loan to ensure status is compatible
    const typedLoan: Loan = {
      ...loan,
      status: loan.status as Loan['status']
    };
    try {
      if (!actionReason) {
        toast({
          title: 'Motif requis',
          description: 'Veuillez indiquer le motif du rejet',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
          processed_by: 'current_user', // Replace with actual user ID
          rejection_reason: actionReason
        })
        .eq('id', typedLoan.id);

      if (error) throw error;

      await logAuditEvent(
        `Loan ${typedLoan.reference} rejected`,
        AuditLogCategory.LOAN,
        AuditLogSeverity.INFO,
        { loanId: typedLoan.id, reason: actionReason }
      );

      toast({
        title: 'Prêt rejeté',
        description: 'Le prêt a été rejeté',
      });

      fetchLoans();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error rejecting loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de rejeter le prêt',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleDisburseLoan = async (loan: Loan) => {
    // Cast the loan to ensure status is compatible
    const typedLoan: Loan = {
      ...loan,
      status: loan.status as Loan['status']
    };
    try {
      const disbursementReference = `DIS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const { error } = await supabase
        .from('sfd_loans')
        .update({
          status: 'approved',
          disbursed_at: new Date().toISOString()
        })
        .eq('id', typedLoan.id);

      if (error) throw error;

      await logAuditEvent(
        `Loan ${typedLoan.reference} disbursed`,
        AuditLogCategory.LOAN,
        AuditLogSeverity.INFO,
        { loanId: typedLoan.id, disbursementReference }
      );

      toast({
        title: 'Prêt décaissé',
        description: 'Le prêt a été décaissé avec succès',
      });

      fetchLoans();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error disbursing loan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de décaisser le prêt',
        variant: 'destructive',
      });
    } finally {
      setIsConfirmDialogOpen(false);
    }
  };

  const handleConfirmAction = () => {
    if (!selectedLoan || !confirmAction) return;

    switch (confirmAction) {
      case 'approve':
        handleApproveLoan(selectedLoan);
        break;
      case 'reject':
        handleRejectLoan(selectedLoan);
        break;
      case 'disburse':
        handleDisburseLoan(selectedLoan);
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Approuvé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejeté</Badge>;
      case 'disbursed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Décaissé</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Terminé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Contrats de Prêt</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="approved">Approuvés</TabsTrigger>
              <TabsTrigger value="rejected">Rejetés</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par client ou référence..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select 
                  value={statusFilter} 
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="disbursed">Décaissé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={resetFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
            
            <TabsContent value={activeTab} className="pt-2">
              {isLoading ? (
                <div className="text-center py-8">Chargement des prêts...</div>
              ) : filteredLoans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun prêt trouvé avec les critères sélectionnés
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLoans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">{loan.reference}</TableCell>
                          <TableCell>{loan.client_name}</TableCell>
                          <TableCell>{formatCurrency(loan.amount)}</TableCell>
                          <TableCell>{loan.duration_months} mois</TableCell>
                          <TableCell>{formatDate(loan.created_at)}</TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewLoan(loan)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Détails
                              </Button>
                              
                              {loan.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => openConfirmDialog(loan, 'approve')}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Approuver
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openConfirmDialog(loan, 'reject')}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Rejeter
                                  </Button>
                                </>
                              )}
                              
                              {loan.status === 'approved' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  onClick={() => openConfirmDialog(loan, 'disburse')}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Décaisser
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* View Loan Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du Prêt</DialogTitle>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Référence</h3>
                  <p className="font-medium">{selectedLoan.reference}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Statut</h3>
                  <div>{getStatusBadge(selectedLoan.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Client</h3>
                  <p>{selectedLoan.client_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Date de création</h3>
                  <p>{formatDate(selectedLoan.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Montant</h3>
                  <p className="font-medium">{formatCurrency(selectedLoan.amount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Durée</h3>
                  <p>{selectedLoan.duration_months} mois</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Taux d'intérêt</h3>
                  <p>{selectedLoan.interest_rate}%</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Paiement mensuel</h3>
                  <p>{formatCurrency(selectedLoan.monthly_payment)}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Objet du prêt</h3>
                <p className="text-sm">{selectedLoan.purpose}</p>
              </div>
              
              {selectedLoan.status === 'approved' && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Date d'approbation</h3>
                  <p>{selectedLoan.approved_at ? formatDate(selectedLoan.approved_at) : 'N/A'}</p>
                </div>
              )}
              
              {selectedLoan.status === 'disbursed' && (
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Date de décaissement</h3>
                    <p>{selectedLoan.disbursed_at ? formatDate(selectedLoan.disbursed_at) : 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Référence de décaissement</h3>
                    <p>{selectedLoan.disbursement_reference || 'N/A'}</p>
                  </div>
                </div>
              )}
              
              {selectedLoan.status === 'rejected' && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Motif du rejet</h3>
                  <p className="text-sm">{selectedLoan.rejection_reason || 'Aucun motif spécifié'}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
            
            {selectedLoan && selectedLoan.status === 'pending' && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openConfirmDialog(selectedLoan, 'reject');
                  }}
                >
                  Rejeter
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openConfirmDialog(selectedLoan, 'approve');
                  }}
                >
                  Approuver
                </Button>
              </>
            )}
            
            {selectedLoan && selectedLoan.status === 'approved' && (
              <Button 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  openConfirmDialog(selectedLoan, 'disburse');
                }}
              >
                Décaisser
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Action Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'approve' && "Approuver le prêt"}
              {confirmAction === 'reject' && "Rejeter le prêt"}
              {confirmAction === 'disburse' && "Décaisser le prêt"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'approve' && "Vous êtes sur le point d'approuver ce prêt."}
              {confirmAction === 'reject' && "Vous êtes sur le point de rejeter ce prêt."}
              {confirmAction === 'disburse' && "Vous êtes sur le point de décaisser ce prêt. Le montant sera crédité au compte du client."}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                  <p>{selectedLoan.client_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Référence</h3>
                  <p>{selectedLoan.reference}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Montant</h3>
                  <p>{formatCurrency(selectedLoan.amount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Durée</h3>
                  <p>{selectedLoan.duration_months} mois</p>
                </div>
              </div>
              
              {confirmAction === 'reject' && (
                <div className="mb-4">
                  <label htmlFor="reason" className="block text-sm font-medium mb-1">
                    Motif du rejet <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="reason"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Veuillez indiquer le motif du rejet"
                    rows={3}
                  />
                </div>
              )}
              
              {confirmAction === 'approve' && (
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium mb-1">
                    Notes (facultatif)
                  </label>
                  <Textarea
                    id="notes"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Ajouter des notes ou commentaires"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant={confirmAction === 'reject' ? 'destructive' : 'default'}
              onClick={handleConfirmAction}
            >
              {confirmAction === 'approve' && "Approuver"}
              {confirmAction === 'reject' && "Rejeter"}
              {confirmAction === 'disburse' && "Décaisser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
