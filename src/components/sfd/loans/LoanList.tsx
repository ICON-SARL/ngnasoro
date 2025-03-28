
import React from 'react';
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

interface Loan {
  id: string;
  reference?: string;
  client_id: string;
  client_name?: string;
  amount: number;
  duration_months: number;
  interest_rate: number;
  status: string;
  subsidy_amount: number;
}

interface LoanListProps {
  loans: Loan[];
  loading: boolean;
}

const LoanList: React.FC<LoanListProps> = ({ loans, loading }) => {
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Chargement des prêts...</p>
      </div>
    );
  }
  
  if (loans.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center py-8">
          Aucun prêt trouvé
        </TableCell>
      </TableRow>
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
