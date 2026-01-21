
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Banknote,
  Building,
  AlertTriangle
} from 'lucide-react';
import { useMerefSfdLoans, MerefSfdLoan } from '@/hooks/useMerefSfdLoans';
import { formatDateToLocale } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { MerefSfdLoanDetails } from './MerefSfdLoanDetails';
import { MerefLoanApprovalDialog } from './MerefLoanApprovalDialog';

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
    pending: { label: 'En attente', variant: 'outline', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    approved: { label: 'Approuvé', variant: 'outline', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    rejected: { label: 'Rejeté', variant: 'destructive', className: '' },
    active: { label: 'Actif', variant: 'outline', className: 'bg-green-100 text-green-800 border-green-200' },
    completed: { label: 'Remboursé', variant: 'outline', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    defaulted: { label: 'En défaut', variant: 'destructive', className: '' },
  };

  const { label, variant, className } = config[status] || { label: status, variant: 'outline', className: '' };
  return <Badge variant={variant} className={className}>{label}</Badge>;
};

export function MerefSfdLoansList() {
  const { user } = useAuth();
  const { loans, isLoading, approveLoan, rejectLoan, disburseLoan } = useMerefSfdLoans();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<MerefSfdLoan | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [loanToProcess, setLoanToProcess] = useState<MerefSfdLoan | null>(null);

  const filteredLoans = loans?.filter(loan =>
    loan.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.sfds?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleApprove = async (loan: MerefSfdLoan) => {
    if (!user?.id) return;
    await approveLoan.mutateAsync({ loanId: loan.id, approvedBy: user.id });
  };

  const handleReject = (loan: MerefSfdLoan) => {
    setLoanToProcess(loan);
    setApprovalDialogOpen(true);
  };

  const handleDisburse = async (loan: MerefSfdLoan) => {
    await disburseLoan.mutateAsync(loan.id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Prêts MEREF aux SFD
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun prêt trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>SFD</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Restant</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{loan.reference}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {loan.sfds?.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {loan.amount?.toLocaleString('fr-FR')} FCFA
                    </TableCell>
                    <TableCell className="text-right">
                      {loan.status === 'active' && (
                        <span className={loan.remaining_amount > loan.amount * 0.5 ? 'text-orange-600' : 'text-green-600'}>
                          {loan.remaining_amount?.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{loan.interest_rate}%</TableCell>
                    <TableCell>{loan.duration_months} mois</TableCell>
                    <TableCell>{getStatusBadge(loan.status)}</TableCell>
                    <TableCell>{formatDateToLocale(loan.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedLoan(loan)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          {loan.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(loan)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Approuver
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(loan)}>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Rejeter
                              </DropdownMenuItem>
                            </>
                          )}
                          {loan.status === 'approved' && (
                            <DropdownMenuItem onClick={() => handleDisburse(loan)}>
                              <Banknote className="mr-2 h-4 w-4 text-blue-600" />
                              Décaisser
                            </DropdownMenuItem>
                          )}
                          {loan.status === 'active' && loan.next_payment_date && new Date(loan.next_payment_date) < new Date() && (
                            <DropdownMenuItem className="text-orange-600">
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              En retard
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedLoan && (
        <MerefSfdLoanDetails
          loan={selectedLoan}
          open={!!selectedLoan}
          onClose={() => setSelectedLoan(null)}
        />
      )}

      {loanToProcess && (
        <MerefLoanApprovalDialog
          loan={loanToProcess}
          open={approvalDialogOpen}
          onClose={() => {
            setApprovalDialogOpen(false);
            setLoanToProcess(null);
          }}
          onReject={async (reason) => {
            await rejectLoan.mutateAsync({ loanId: loanToProcess.id, reason });
            setApprovalDialogOpen(false);
            setLoanToProcess(null);
          }}
        />
      )}
    </>
  );
}
