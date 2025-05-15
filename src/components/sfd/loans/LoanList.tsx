
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Search,
  RefreshCw,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useSfdLoans } from '@/hooks/useSfdLoans';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import LoanDetailsDialog from './LoanDetailsDialog';
import { useLoanRealtime } from '@/hooks/useLoanRealtime';
import { Loan } from '@/types/sfdClients';
import LoadingSpinner from '@/components/ui/loading-spinner';

const LoanList: React.FC = () => {
  const { loans, isLoading, error, refetch } = useSfdLoans();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use the new realtime hook
  const { isConnected } = useLoanRealtime();
  
  // Filter loans based on search term
  const filteredLoans = loans.filter(loan => 
    loan.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(loan.amount).includes(searchTerm) ||
    loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Liste actualisée",
        description: "La liste des prêts a été mise à jour",
      });
    } catch (err) {
      console.error('Error refreshing loans:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser la liste des prêts",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    // Refresh the list to get any updates
    refetch();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-blue-100 text-blue-800">Approuvé</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Notify user about realtime connection status
  useEffect(() => {
    if (isConnected) {
      console.log('Realtime connection established for loans');
    }
  }, [isConnected]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un prêt..."
            className="pl-8 w-[250px] md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-4 border rounded-md bg-red-50 text-red-800 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p>Une erreur est survenue lors du chargement des prêts.</p>
        </div>
      ) : (
        <Table>
          {filteredLoans.length === 0 && (
            <TableCaption>
              {loans.length === 0 ? 
                "Aucun prêt trouvé. Les nouvelles demandes apparaîtront ici." : 
                "Aucun résultat pour cette recherche."}
            </TableCaption>
          )}
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLoans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">
                  {loan.reference || loan.id.substring(0, 8)}
                </TableCell>
                <TableCell>{loan.client_name || 'Client inconnu'}</TableCell>
                <TableCell>{loan.amount?.toLocaleString()} FCFA</TableCell>
                <TableCell className="max-w-[200px] truncate">{loan.purpose}</TableCell>
                <TableCell>{formatDate(loan.created_at)}</TableCell>
                <TableCell>{getStatusBadge(loan.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(loan)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selectedLoan && (
        <LoanDetailsDialog
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          loan={selectedLoan}
          onLoanUpdated={refetch}
        />
      )}
    </div>
  );
};

export default LoanList;
