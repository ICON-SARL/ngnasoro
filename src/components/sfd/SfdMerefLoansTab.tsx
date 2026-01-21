
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CreditCard, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Banknote,
  Calendar
} from 'lucide-react';
import { useMerefSfdLoans, MerefSfdLoan } from '@/hooks/useMerefSfdLoans';
import { useActiveSfdId } from '@/hooks/useActiveSfdId';
import { formatDateToLocale } from '@/utils/dateUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { MerefLoanRequestForm } from './MerefLoanRequestForm';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const getStatusBadge = (status: string) => {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
    approved: { label: 'Approuvé', className: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="h-3 w-3" /> },
    active: { label: 'Actif', className: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
    completed: { label: 'Remboursé', className: 'bg-gray-100 text-gray-800', icon: <CheckCircle className="h-3 w-3" /> },
    defaulted: { label: 'En défaut', className: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
    rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
  };

  const { label, className, icon } = config[status] || { label: status, className: '', icon: null };
  return (
    <Badge variant="outline" className={`${className} flex items-center gap-1`}>
      {icon}
      {label}
    </Badge>
  );
};

export function SfdMerefLoansTab() {
  const { user } = useAuth();
  const { activeSfdId } = useActiveSfdId();
  const { loans, payments, isLoading, recordPayment } = useMerefSfdLoans(activeSfdId || undefined);
  const [activeTab, setActiveTab] = useState('list');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<MerefSfdLoan | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const activeLoans = loans?.filter(l => l.status === 'active') || [];
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.remaining_amount || 0), 0);

  const handleRecordPayment = async () => {
    if (!selectedLoan || !paymentAmount || !activeSfdId) return;

    await recordPayment.mutateAsync({
      meref_loan_id: selectedLoan.id,
      sfd_id: activeSfdId,
      amount: Number(paymentAmount),
      payment_method: 'bank_transfer',
      reference: paymentReference || undefined,
      recorded_by: user?.id
    });

    setPaymentDialogOpen(false);
    setSelectedLoan(null);
    setPaymentAmount('');
    setPaymentReference('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prêts actifs</p>
                <p className="text-2xl font-bold">{activeLoans.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Encours total</p>
                <p className="text-2xl font-bold">{totalOutstanding.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <Banknote className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prochaine échéance</p>
                {activeLoans[0]?.next_payment_date ? (
                  <p className="text-lg font-semibold">
                    {formatDateToLocale(activeLoans[0].next_payment_date)}
                  </p>
                ) : (
                  <p className="text-muted-foreground">-</p>
                )}
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Mes prêts MEREF</TabsTrigger>
          <TabsTrigger value="new">
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle demande
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {!loans || loans.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Vous n'avez pas encore de prêt MEREF.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Faire une demande
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Historique des prêts MEREF</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Restant</TableHead>
                      <TableHead>Progression</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => {
                      const progress = loan.total_amount > 0 
                        ? ((loan.total_amount - loan.remaining_amount) / loan.total_amount) * 100 
                        : 0;

                      return (
                        <TableRow key={loan.id}>
                          <TableCell className="font-mono">{loan.reference}</TableCell>
                          <TableCell className="text-right font-medium">
                            {loan.amount?.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell className="text-right">
                            {loan.remaining_amount?.toLocaleString('fr-FR')} FCFA
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {progress.toFixed(0)}%
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(loan.status)}</TableCell>
                          <TableCell>
                            {loan.next_payment_date ? formatDateToLocale(loan.next_payment_date) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {loan.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedLoan(loan);
                                  setPaymentAmount(loan.monthly_payment?.toString() || '');
                                  setPaymentDialogOpen(true);
                                }}
                              >
                                <Banknote className="h-4 w-4 mr-1" />
                                Payer
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-4">
          <MerefLoanRequestForm onSuccess={() => setActiveTab('list')} />
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedLoan && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm"><strong>Prêt:</strong> {selectedLoan.reference}</p>
                <p className="text-sm"><strong>Mensualité:</strong> {selectedLoan.monthly_payment?.toLocaleString('fr-FR')} FCFA</p>
                <p className="text-sm"><strong>Restant:</strong> {selectedLoan.remaining_amount?.toLocaleString('fr-FR')} FCFA</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Montant du paiement (FCFA)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Montant"
              />
            </div>
            <div className="space-y-2">
              <Label>Référence du virement (optionnel)</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Référence bancaire"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleRecordPayment}
              disabled={!paymentAmount || recordPayment.isPending}
            >
              {recordPayment.isPending ? 'Traitement...' : 'Confirmer le paiement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
