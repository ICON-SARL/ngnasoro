import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { QrCode, Scan, Building2, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CashierQRScanner } from './CashierQRScanner';

interface AgencyTabProps {
  paymentStatus: 'pending' | 'success' | 'failed' | null;
  handlePayment: () => void;
  isWithdrawal?: boolean;
  onTransactionComplete?: () => void;
}

export const AgencyTab: React.FC<AgencyTabProps> = ({ 
  paymentStatus, 
  handlePayment,
  isWithdrawal = false,
  onTransactionComplete
}) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleScannerSuccess = (transaction: any) => {
    setShowScanner(false);
    onTransactionComplete?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Paiement en agence SFD</h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg text-sm border border-primary/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="mb-2">
                <strong>Comment ça marche:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Rendez-vous au guichet de votre SFD</li>
                <li>Demandez au caissier d'afficher le QR code</li>
                <li>Scannez le QR code avec l'application</li>
                <li>Entrez le montant et confirmez</li>
              </ol>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2" 
          onClick={() => setShowScanner(true)} 
          disabled={paymentStatus === 'pending'}
          size="lg"
        >
          {paymentStatus === 'pending' ? (
            <>
              <Loader size="sm" className="mr-2" />
              Traitement en cours...
            </>
          ) : (
            <>
              <Scan className="h-5 w-5" />
              Scanner le QR du guichet
            </>
          )}
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <p className="flex items-center gap-1">
          <QrCode className="h-3 w-3" />
          Le scanner QR permet de valider votre {isWithdrawal ? 'retrait' : 'dépôt'} rapidement et en toute sécurité.
        </p>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isWithdrawal ? 'Retrait en agence' : 'Dépôt en agence'}
            </DialogTitle>
          </DialogHeader>
          <CashierQRScanner
            isWithdrawal={isWithdrawal}
            onSuccess={handleScannerSuccess}
            onCancel={() => setShowScanner(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
