
import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoansPage } from '@/hooks/sfd/useLoansPage';
import { Loan } from '@/types/sfdClients';

// Define props interface for when receiving loans and loading state from parent
interface LoanListProps {
  loans?: Loan[];
  loading?: boolean;
}

const LoanList: React.FC<LoanListProps> = (props) => {
  const navigate = useNavigate();
  // Use provided loans/loading or fetch them with the hook
  const { loans: fetchedLoans, isLoading: fetchLoading, refetch } = useLoansPage();
  
  // Use props if provided, otherwise use the fetched data
  const loans = props.loans || fetchedLoans;
  const isLoading = props.loading || fetchLoading;
  
  useEffect(() => {
    // Only fetch if we're not using provided loans
    if (!props.loans) {
      refetch();
    }
  }, [props.loans, refetch]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Chargement des prêts...</p>
      </div>
    );
  }
  
  if (!loans || loans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun prêt trouvé</p>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Durée</TableHead>
          <TableHead>Taux</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Subvention</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loans.map((loan) => (
          <TableRow key={loan.id}>
            <TableCell className="font-medium">{loan.reference || loan.id.substring(0, 8)}</TableCell>
            <TableCell>{loan.client_name || 'Client #' + loan.client_id.substring(0, 4)}</TableCell>
            <TableCell>{loan.amount.toLocaleString()} FCFA</TableCell>
            <TableCell>{loan.duration_months} mois</TableCell>
            <TableCell>{loan.interest_rate}%</TableCell>
            <TableCell>
              {loan.status === 'pending' && <Badge variant="outline">En attente</Badge>}
              {loan.status === 'approved' && <Badge className="bg-blue-100 text-blue-800">Approuvé</Badge>}
              {loan.status === 'active' && <Badge className="bg-green-100 text-green-800">Actif</Badge>}
              {loan.status === 'rejected' && <Badge className="bg-red-100 text-red-800">Rejeté</Badge>}
              {loan.status === 'completed' && <Badge className="bg-gray-100 text-gray-800">Terminé</Badge>}
              {loan.status === 'defaulted' && <Badge className="bg-red-200 text-red-900">En défaut</Badge>}
            </TableCell>
            <TableCell>
              {loan.subsidy_amount > 0 ? 
                `${loan.subsidy_amount.toLocaleString()} FCFA` : 
                'Non'
              }
            </TableCell>
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/sfd-loans/${loan.id}`)}
              >
                <FileText className="h-4 w-4 mr-1" />
                Détails
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LoanList;
