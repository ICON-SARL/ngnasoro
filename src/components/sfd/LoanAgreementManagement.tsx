import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CreditCard, 
  UserCheck, 
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { useToast } from '@/hooks/use-toast';
import { Loan } from '@/types/sfdClients';

const LoanAgreementManagement = () => {
  const { data: loans, isLoading, approveLoan, rejectLoan, disburseLoan } = useSfdLoans();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'disburse' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filterLoans = (status: 'pending' | 'approved' | 'active' | 'all') => {
    return loans.filter(loan => {
      const matchesSearch = 
        searchQuery === '' || 
        loan.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.client_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        status === 'all' || 
        loan.status === status;
      
      return matchesSearch && matchesStatus;
    });
  };

  const pendingLoans = filterLoans('pending');
  const approvedLoans = filterLoans('approved');
  const activeLoans = filterLoans('active');
  
  const handleAction = (loan: Loan, action: 'approve' | 'reject' | 'disburse') => {
    setSelectedLoan(loan);
    setActionType(action);
    setShowDialog(true);
  };
  
  const processAction = async () => {
    if (!selectedLoan || !actionType) return;
    
    setIsProcessing(true);
    
    try {
      if (actionType === 'approve') {
        await approveLoan.mutateAsync(selectedLoan.id);
      } else if (actionType === 'reject') {
        await rejectLoan.mutateAsync(selectedLoan.id);
      } else if (actionType === 'disburse') {
        await disburseLoan.mutateAsync(selectedLoan.id);
      }
      setShowDialog(false);
    } catch (error) {
      console.error("Error processing loan action:", error);
      toast({
        title: "Erreur de traitement",
        description: "Une erreur est survenue lors du traitement de cette action",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' FCFA';
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approuvé</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Actif</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const renderLoanCard = (loan: Loan) => {
    return (
      <Card key={loan.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Prêt #{loan.id.substring(0, 8)}</CardTitle>
              <p className="text-sm text-gray-500">Client: {loan.client_id.substring(0, 8)}...</p>
            </div>
            {renderStatusBadge(loan.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Montant</p>
              <p className="font-semibold">{formatCurrency(loan.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Durée</p>
              <p className="font-semibold">{loan.duration_months} mois</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Objet</p>
              <p className="font-semibold capitalize">{loan.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Taux</p>
              <p className="font-semibold">{loan.interest_rate}%</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {loan.status === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                  onClick={() => handleAction(loan, 'approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approuver
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                  onClick={() => handleAction(loan, 'reject')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
              </>
            )}
            
            {loan.status === 'approved' && (
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                onClick={() => handleAction(loan, 'disburse')}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Débourser
              </Button>
            )}
            
            <Button size="sm" variant="ghost">
              <FileText className="h-4 w-4 mr-1" />
              Détails
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <Clock className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Gestion des Accords de Prêt</h2>
        <p className="text-gray-500">
          Approuvez, rejetez ou déboursez les demandes de prêt des clients.
        </p>
      </div>
      
      <div className="flex mb-6 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par client ou objet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Montant croissant</DropdownMenuItem>
            <DropdownMenuItem>Montant décroissant</DropdownMenuItem>
            <DropdownMenuItem>Date récente</DropdownMenuItem>
            <DropdownMenuItem>Date ancienne</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            En attente
            {pendingLoans.length > 0 && (
              <Badge className="ml-2 bg-yellow-500">{pendingLoans.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvés
            {approvedLoans.length > 0 && (
              <Badge className="ml-2 bg-blue-500">{approvedLoans.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            Actifs
            {activeLoans.length > 0 && (
              <Badge className="ml-2 bg-green-500">{activeLoans.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingLoans.length > 0 ? (
            pendingLoans.map(loan => renderLoanCard(loan))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium">Aucune demande en attente</h3>
              <p className="text-gray-500">Toutes les demandes ont été traitées</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved">
          {approvedLoans.length > 0 ? (
            approvedLoans.map(loan => renderLoanCard(loan))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium">Aucun prêt à débourser</h3>
              <p className="text-gray-500">Tous les prêts approuvés ont été déboursés</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {activeLoans.length > 0 ? (
            activeLoans.map(loan => renderLoanCard(loan))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium">Aucun prêt actif</h3>
              <p className="text-gray-500">Aucun prêt n'a encore été déboursé</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all">
          {loans.length > 0 ? (
            loans.map(loan => renderLoanCard(loan))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium">Aucun prêt trouvé</h3>
              <p className="text-gray-500">Aucune demande de prêt n'a été enregistrée</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && "Approuver le prêt"}
              {actionType === 'reject' && "Rejeter le prêt"}
              {actionType === 'disburse' && "Débourser le prêt"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant:</span>
                  <span className="font-medium">{formatCurrency(selectedLoan.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Durée:</span>
                  <span className="font-medium">{selectedLoan.duration_months} mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Objet:</span>
                  <span className="font-medium capitalize">{selectedLoan.purpose}</span>
                </div>
              </div>
              
              {actionType === 'approve' && (
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-700 font-medium">Confirmation d'approbation</p>
                    <p className="text-xs text-yellow-600">
                      Êtes-vous sûr de vouloir approuver ce prêt ? 
                      Cela indique que toutes les conditions préalables ont été vérifiées.
                    </p>
                  </div>
                </div>
              )}
              
              {actionType === 'reject' && (
                <div className="flex items-start p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Confirmation de rejet</p>
                    <p className="text-xs text-red-600">
                      Êtes-vous sûr de vouloir rejeter ce prêt ?
                      Cette action est définitive et sera communiquée au client.
                    </p>
                  </div>
                </div>
              )}
              
              {actionType === 'disburse' && (
                <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Confirmation de déboursement</p>
                    <p className="text-xs text-blue-600">
                      Êtes-vous sûr de vouloir débourser ce prêt ?
                      Les fonds seront transférés au compte du client sous 24h.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button 
              onClick={processAction}
              disabled={isProcessing}
              className={
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isProcessing ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {actionType === 'approve' && "Approuver"}
                  {actionType === 'reject' && "Rejeter"}
                  {actionType === 'disburse' && "Débourser"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanAgreementManagement;
