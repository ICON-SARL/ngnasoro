
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { FormGroup } from '@/components/FormGroup';
import { Shield, Lock, AlertTriangle, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionSecurityDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionSecurityDialog: React.FC<TransactionSecurityDialogProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [enableRollback, setEnableRollback] = useState(true);
  const [enableAuditLogging, setEnableAuditLogging] = useState(true);
  const [enableReceiptGeneration, setEnableReceiptGeneration] = useState(true);
  const [enableMobileMoneySync, setEnableMobileMoneySync] = useState(true);
  const [dailyWithdrawalLimit, setDailyWithdrawalLimit] = useState(5000000);
  
  const handleSaveSettings = () => {
    // In a real app, we would save these settings to the database
    // For now, just show a toast
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres de sécurité ont été mis à jour"
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Paramètres de Sécurité des Transactions
          </DialogTitle>
          <DialogDescription>
            Configurez les paramètres de sécurité pour toutes les transactions financières.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Card className="p-4">
            <h3 className="text-sm font-medium flex items-center">
              <Lock className="h-4 w-4 mr-2 text-blue-600" />
              Intégrité des Transactions
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Paramètres affectant la sécurité et l'intégrité des transactions.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="rollback">Rollback Automatique</Label>
                  <p className="text-xs text-muted-foreground">
                    Annulation automatique en cas d'échec
                  </p>
                </div>
                <Switch
                  id="rollback"
                  checked={enableRollback}
                  onCheckedChange={setEnableRollback}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audit">Journalisation Chiffrée</Label>
                  <p className="text-xs text-muted-foreground">
                    Enregistrement sécurisé des transactions
                  </p>
                </div>
                <Switch
                  id="audit"
                  checked={enableAuditLogging}
                  onCheckedChange={setEnableAuditLogging}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="receipt">Génération de Reçu</Label>
                  <p className="text-xs text-muted-foreground">
                    Génération automatique de reçus PDF
                  </p>
                </div>
                <Switch
                  id="receipt"
                  checked={enableReceiptGeneration}
                  onCheckedChange={setEnableReceiptGeneration}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="momo">Sync Mobile Money</Label>
                  <p className="text-xs text-muted-foreground">
                    Synchronisation avec les opérateurs mobiles
                  </p>
                </div>
                <Switch
                  id="momo"
                  checked={enableMobileMoneySync}
                  onCheckedChange={setEnableMobileMoneySync}
                />
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <h3 className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-amber-600" />
              Limites de Transaction
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Limites pour contrôler les montants des transactions.
            </p>
            
            <FormGroup className="flex flex-col space-y-1.5">
              <Label htmlFor="daily-limit">Limite Quotidienne de Retrait (FCFA)</Label>
              <Input
                id="daily-limit"
                value={dailyWithdrawalLimit}
                onChange={(e) => setDailyWithdrawalLimit(parseInt(e.target.value) || 0)}
                type="number"
              />
            </FormGroup>
          </Card>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm flex items-start">
            <AlertTriangle className="h-4 w-4 text-amber-600 mr-2 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Important</p>
              <p className="text-amber-700">
                Les transactions atomiques assurent l'intégrité des données, mais peuvent affecter 
                les performances pour les opérations à volume très élevé.
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSaveSettings}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
