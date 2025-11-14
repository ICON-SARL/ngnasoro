import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface CashSessionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'open' | 'close';
  sfdId?: string;
  currentSession?: any;
  onSuccess?: () => void;
}

export function CashSessionManager({
  open,
  onOpenChange,
  mode,
  sfdId,
  currentSession,
  onSuccess
}: CashSessionManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenSession = async () => {
    if (!sfdId) {
      toast({
        title: 'Erreur',
        description: 'SFD ID requis',
        variant: 'destructive'
      });
      return;
    }

    const balance = parseFloat(openingBalance);
    if (isNaN(balance) || balance < 0) {
      toast({
        title: 'Erreur',
        description: 'Solde d\'ouverture invalide',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('open-cash-session', {
        body: {
          sfdId,
          openingBalance: balance,
          notes
        }
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Caisse ouverte avec succès'
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error opening session:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'ouvrir la caisse',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!currentSession) return;

    const balance = parseFloat(closingBalance);
    if (isNaN(balance) || balance < 0) {
      toast({
        title: 'Erreur',
        description: 'Solde de fermeture invalide',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('close-cash-session', {
        body: {
          sessionId: currentSession.id,
          closingBalance: balance,
          notes
        }
      });

      if (error) throw error;

      const result = data?.data;
      const hasDifference = Math.abs(result?.difference || 0) > 0.01;

      toast({
        title: hasDifference ? 'Attention' : 'Succès',
        description: hasDifference
          ? `Caisse fermée avec un écart de ${result?.difference} FCFA${result?.requires_validation ? '. Validation superviseur requise.' : ''}`
          : 'Caisse fermée avec succès'
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error closing session:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de fermer la caisse',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'open') {
      handleOpenSession();
    } else {
      handleCloseSession();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'open' ? 'Ouvrir la caisse' : 'Fermer la caisse'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'open'
              ? 'Saisissez le solde d\'ouverture de votre caisse'
              : 'Comptez votre caisse et saisissez le montant total'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'open' ? (
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Solde d'ouverture (FCFA)</Label>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0"
                required
              />
              <p className="text-sm text-muted-foreground">
                Montant total en caisse au début de la journée
              </p>
            </div>
          ) : (
            <>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Solde d'ouverture:</span>
                  <span className="font-semibold">
                    {currentSession?.opening_balance?.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Solde attendu:</span>
                  <span className="font-semibold text-green-600">
                    Calculé automatiquement
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingBalance">Solde de fermeture (FCFA)</Label>
                <Input
                  id="closingBalance"
                  type="number"
                  step="0.01"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  placeholder="0"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Montant total compté en caisse maintenant
                </p>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Commentaires ou observations..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'open' ? 'Ouvrir la caisse' : 'Fermer la caisse'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
