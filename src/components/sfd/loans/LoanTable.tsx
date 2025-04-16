
import { useEffect, useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loan } from '@/types/sfdClients';

interface LoanTableProps {
  status?: string;
  searchQuery?: string;
  periodFilter?: string;
}

export function LoanTable({ status = 'all', searchQuery = '', periodFilter = 'all' }: LoanTableProps) {
  const { activeSfdId } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeSfdId) return;

    const fetchLoans = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('sfd_loans')
          .select(`
            *,
            sfd_clients(full_name)
          `)
          .eq('sfd_id', activeSfdId);

        // Apply status filter
        if (status !== 'all') {
          query = query.eq('status', status);
        }

        // Apply period filter
        if (periodFilter !== 'all') {
          const now = new Date();
          let startDate;
          
          switch (periodFilter) {
            case 'this-month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              query = query.gte('created_at', startDate.toISOString());
              break;
            case 'last-month':
              startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
              query = query
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());
              break;
            case 'this-year':
              startDate = new Date(now.getFullYear(), 0, 1);
              query = query.gte('created_at', startDate.toISOString());
              break;
          }
        }

        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          query = query.or(`
            reference.ilike.%${searchLower}%,
            sfd_clients.full_name.ilike.%${searchLower}%,
            amount::text.ilike.%${searchLower}%
          `);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        setLoans(data || []);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [activeSfdId, status, searchQuery, periodFilter]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Clôturé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date début</TableHead>
            <TableHead>Date fin</TableHead>
            <TableHead>Taux</TableHead>
            <TableHead>Restant</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Chargement des prêts...
              </TableCell>
            </TableRow>
          ) : loans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Aucun prêt trouvé
              </TableCell>
            </TableRow>
          ) : (
            loans.map((loan) => (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">
                  {loan.reference || loan.id.substring(0, 8)}
                </TableCell>
                <TableCell>
                  {loan.sfd_clients?.full_name || `Client #${loan.client_id.substring(0, 4)}`}
                </TableCell>
                <TableCell>{loan.amount.toLocaleString('fr-FR')} FCFA</TableCell>
                <TableCell>{getStatusBadge(loan.status)}</TableCell>
                <TableCell>{loan.disbursed_at ? formatDate(loan.disbursed_at) : '-'}</TableCell>
                <TableCell>{loan.next_payment_date ? formatDate(loan.next_payment_date) : '-'}</TableCell>
                <TableCell>{loan.interest_rate}%</TableCell>
                <TableCell>{(loan.amount - (loan.monthly_payment || 0)).toLocaleString('fr-FR')} FCFA</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/sfd/loans/${loan.id}`)}
                  >
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
