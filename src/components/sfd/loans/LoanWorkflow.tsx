import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Settings, Calendar, Clock, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { loanService } from '@/utils/sfdLoanApi';
import LoanConfigDialog from './LoanConfigDialog';
import NewLoanDialog from './NewLoanDialog';
import LoanDetailsDialog from './LoanDetailsDialog';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Loan } from '@/types/sfdClients';

export const LoanWorkflow = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLoans();
  }, [activeSfdId]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!activeSfdId) {
        console.warn('No active SFD ID found in useAuth');
        setError("Aucune SFD active n'a été trouvée. Veuillez sélectionner une SFD.");
        setLoading(false);
        return;
      }
      
      console.log('Fetching loans with SFD ID:', activeSfdId);
      const fetchedLoans = await loanService.getSfdLoans(activeSfdId);
      console.log('Fetched loans:', fetchedLoans);
      setLoans(fetchedLoans);
    } catch (err: any) {
      console.error('Error in fetchLoans:', err);
      setError("Impossible de charger les prêts. Veuillez réessayer plus tard.");
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les prêts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoanCreated = () => {
    setIsAddingLoan(false);
    fetchLoans();
  };

  const handleConfigSaved = () => {
    setIsConfiguring(false);
    toast({
      title: 'Configuration sauvegardée',
      description: 'Les paramètres de prêt ont été mis à jour',
    });
  };

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailsOpen(true);
  };

  const filterLoansByStatus = (status?: string) => {
    if (!status || status === 'all') return loans;
    return loans.filter(loan => {
      if (status === 'requests') return loan.status === 'pending';
      if (status === 'active') return loan.status === 'active' || loan.status === 'approved';
      if (status === 'history') return loan.status === 'completed' || loan.status === 'rejected' || loan.status === 'defaulted';
      return loan.status === status;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Workflow de Prêt</h2>
          <p className="text-sm text-muted-foreground">
            Configuration et gestion du cycle de prêt
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsConfiguring(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurer
          </Button>
          <Button onClick={() => setIsAddingLoan(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Prêt
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="mb-4">
          <TabsTrigger value="requests" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Demandes de prêt
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            Prêts actifs
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center flex-col gap-4">
              <div className="bg-red-100 text-red-800 p-4 rounded-md">
                <p className="font-medium">{error}</p>
              </div>
              <Button onClick={fetchLoans}>Réessayer</Button>
            </div>
          ) : (
            <div className="border rounded-lg">
              <table className="min-w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Montant</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Durée</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Objet</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filterLoansByStatus(activeTab).length > 0 ? (
                    filterLoansByStatus(activeTab).map((loan) => (
                      <tr key={loan.id}>
                        <td className="px-4 py-3 text-sm font-medium">{loan.reference || loan.id.substring(0, 8)}</td>
                        <td className="px-4 py-3 text-sm">{loan.client_name || `Client #${loan.client_id.substring(0, 6)}`}</td>
                        <td className="px-4 py-3 text-sm">{loan.amount.toLocaleString()} FCFA</td>
                        <td className="px-4 py-3 text-sm">{loan.duration_months} mois</td>
                        <td className="px-4 py-3 text-sm">{loan.purpose}</td>
                        <td className="px-4 py-3 text-sm">
                          {loan.status === 'pending' && (
                            <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
                          )}
                          {loan.status === 'approved' && (
                            <Badge className="bg-blue-100 text-blue-800">Approuvé</Badge>
                          )}
                          {loan.status === 'active' && (
                            <Badge className="bg-green-100 text-green-800">Actif</Badge>
                          )}
                          {loan.status === 'completed' && (
                            <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>
                          )}
                          {loan.status === 'rejected' && (
                            <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
                          )}
                          {loan.status === 'defaulted' && (
                            <Badge className="bg-red-200 text-red-900">En défaut</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(loan)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                        Aucun prêt trouvé dans cette catégorie
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {isConfiguring && (
        <LoanConfigDialog 
          isOpen={isConfiguring} 
          onClose={() => setIsConfiguring(false)}
          onSave={handleConfigSaved}
        />
      )}

      {isAddingLoan && (
        <NewLoanDialog
          isOpen={isAddingLoan}
          onClose={() => setIsAddingLoan(false)}
          onLoanCreated={handleLoanCreated}
        />
      )}

      {selectedLoan && (
        <LoanDetailsDialog
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          loan={selectedLoan}
          onLoanUpdated={fetchLoans}
        />
      )}
    </div>
  );
};

export default LoanWorkflow;
