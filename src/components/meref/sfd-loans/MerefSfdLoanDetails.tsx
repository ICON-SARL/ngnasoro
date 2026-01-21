
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Building, 
  Calendar, 
  CreditCard, 
  Users, 
  TrendingUp,
  Banknote,
  Clock,
  CheckCircle
} from 'lucide-react';
import { MerefSfdLoan, useMerefSfdLoans } from '@/hooks/useMerefSfdLoans';
import { formatDateToLocale } from '@/utils/dateUtils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface MerefSfdLoanDetailsProps {
  loan: MerefSfdLoan;
  open: boolean;
  onClose: () => void;
}

export function MerefSfdLoanDetails({ loan, open, onClose }: MerefSfdLoanDetailsProps) {
  const { payments, traceability, paymentsLoading, traceabilityLoading } = useMerefSfdLoans(loan.sfd_id);

  const loanPayments = payments?.filter(p => p.meref_loan_id === loan.id) || [];
  const loanTraceability = traceability?.filter(t => t.meref_loan_id === loan.id) || [];

  const repaymentProgress = loan.total_amount > 0 
    ? ((loan.total_amount - loan.remaining_amount) / loan.total_amount) * 100 
    : 0;

  const clientLoansCount = loanTraceability.filter(t => t.client_loan_id).length;
  const clientLoansTotal = loanTraceability.reduce((sum, t) => sum + (t.client_loan_amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Prêt {loan.reference}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Building className="h-4 w-4" />
                SFD
              </div>
              <p className="font-semibold">{loan.sfds?.name}</p>
              <p className="text-xs text-muted-foreground">{loan.sfds?.code}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Banknote className="h-4 w-4" />
                Montant
              </div>
              <p className="font-semibold text-lg">{loan.amount?.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs text-muted-foreground">
                Total: {loan.total_amount?.toLocaleString('fr-FR')} FCFA
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Remboursement
              </div>
              <Progress value={repaymentProgress} className="h-2 mb-2" />
              <p className="text-xs">
                {repaymentProgress.toFixed(1)}% remboursé - 
                Restant: {loan.remaining_amount?.toLocaleString('fr-FR')} FCFA
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{loan.interest_rate}%</p>
            <p className="text-xs text-muted-foreground">Taux d'intérêt</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{loan.duration_months}</p>
            <p className="text-xs text-muted-foreground">Mois</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{loan.payments_made}</p>
            <p className="text-xs text-muted-foreground">Paiements effectués</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{clientLoansCount}</p>
            <p className="text-xs text-muted-foreground">Prêts clients</p>
          </div>
        </div>

        <Separator className="my-4" />

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="payments">Paiements ({loanPayments.length})</TabsTrigger>
            <TabsTrigger value="clients">Traçabilité ({clientLoansCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Objectif du prêt</h4>
                <p className="text-sm text-muted-foreground">{loan.purpose}</p>
              </div>
              {loan.justification && (
                <div>
                  <h4 className="font-medium mb-2">Justification</h4>
                  <p className="text-sm text-muted-foreground">{loan.justification}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Dates clés
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>Demande: {formatDateToLocale(loan.created_at)}</li>
                    {loan.approved_at && <li>Approbation: {formatDateToLocale(loan.approved_at)}</li>}
                    {loan.disbursed_at && <li>Décaissement: {formatDateToLocale(loan.disbursed_at)}</li>}
                    {loan.next_payment_date && <li>Prochaine échéance: {formatDateToLocale(loan.next_payment_date)}</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Mensualité
                  </h4>
                  <p className="text-xl font-bold text-primary">
                    {loan.monthly_payment?.toLocaleString('fr-FR')} FCFA/mois
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="mt-4">
            {paymentsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : loanPayments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun paiement enregistré
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDateToLocale(payment.created_at)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {payment.amount?.toLocaleString('fr-FR')} FCFA
                      </TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="clients" className="mt-4">
            {traceabilityLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : loanTraceability.filter(t => t.client_loan_id).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun prêt client financé par ce prêt MEREF
              </p>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <strong>{clientLoansCount}</strong> prêts clients financés pour un total de{' '}
                    <strong>{clientLoansTotal.toLocaleString('fr-FR')} FCFA</strong>
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead className="text-right">Montant prêt</TableHead>
                      <TableHead className="text-right">Restant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanTraceability.filter(t => t.client_loan_id).map((trace) => (
                      <TableRow key={trace.client_loan_id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {trace.client_name}
                          </div>
                        </TableCell>
                        <TableCell>{trace.client_phone || '-'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {trace.client_loan_amount?.toLocaleString('fr-FR')} FCFA
                        </TableCell>
                        <TableCell className="text-right">
                          {trace.client_remaining?.toLocaleString('fr-FR')} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {trace.client_loan_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
