import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AmountDisplay, DateDisplay, StatusBadge, ConfirmDialog } from '@/components/shared';
import { Loader2, CheckCircle, XCircle, FileText, Shield, DollarSign } from 'lucide-react';

interface LoanApprovalPanelProps {
  loan: any;
  onUpdate?: () => void;
}

export function LoanApprovalPanel({ loan, onUpdate }: LoanApprovalPanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('approve-loan', {
        body: {
          loanId: loan.id,
          approved: true
        }
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Prêt approuvé avec succès'
      });

      setShowApproveDialog(false);
      onUpdate?.();
    } catch (error: any) {
      console.error('Error approving loan:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'approuver le prêt',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez fournir une raison de rejet',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('approve-loan', {
        body: {
          loanId: loan.id,
          approved: false,
          rejectionReason
        }
      });

      if (error) throw error;

      toast({
        title: 'Prêt rejeté',
        description: 'Le client a été notifié'
      });

      setShowRejectDialog(false);
      onUpdate?.();
    } catch (error: any) {
      console.error('Error rejecting loan:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de rejeter le prêt',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loan.status !== 'pending') {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Évaluation du prêt</CardTitle>
            <StatusBadge status={loan.status} />
          </div>
          <CardDescription>
            Demande soumise le <DateDisplay date={loan.created_at} format="long" />
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Client Info */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informations client
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nom:</span>
                <span className="font-medium">{loan.client?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Niveau KYC:</span>
                <Badge variant="outline">Niveau {loan.client?.kyc_level || 1}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code client:</span>
                <span className="font-mono text-xs">{loan.client?.client_code}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Loan Details */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Détails du prêt
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant demandé:</span>
                <AmountDisplay amount={loan.amount} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taux d'intérêt:</span>
                <span className="font-medium">{(loan.interest_rate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durée:</span>
                <span className="font-medium">{loan.duration_months} mois</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total à rembourser:</span>
                <AmountDisplay amount={loan.total_amount} className="font-semibold" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mensualité:</span>
                <AmountDisplay amount={loan.monthly_payment} className="text-primary" />
              </div>
            </div>
          </div>

          {loan.purpose && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Objet du prêt</h3>
                <p className="text-sm text-muted-foreground">{loan.purpose}</p>
              </div>
            </>
          )}

          {loan.collaterals && loan.collaterals.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Garanties ({loan.collaterals.length})
                </h3>
                <div className="space-y-2">
                  {loan.collaterals.map((col: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="text-sm font-medium">{col.collateral_type}</p>
                        <p className="text-xs text-muted-foreground">{col.description}</p>
                      </div>
                      <AmountDisplay amount={col.estimated_value} className="text-sm" />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => setShowRejectDialog(true)}
            disabled={loading}
            className="flex-1"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejeter
          </Button>
          <Button
            onClick={() => setShowApproveDialog(true)}
            disabled={loading}
            className="flex-1"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approuver
          </Button>
        </CardFooter>
      </Card>

      {/* Approve Dialog */}
      <ConfirmDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        title="Approuver ce prêt ?"
        description={`Vous êtes sur le point d'approuver un prêt de ${loan.amount.toLocaleString()} FCFA pour ${loan.client?.full_name}.`}
        confirmText="Approuver"
        onConfirm={handleApprove}
      />

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter ce prêt</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Raison du rejet</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Expliquez pourquoi ce prêt est rejeté..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
