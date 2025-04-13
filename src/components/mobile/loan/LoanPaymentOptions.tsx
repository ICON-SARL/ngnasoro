
import React, { useState } from 'react';
import { Loan } from '@/types/sfdClients';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, QrCode, CreditCard, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import MobileMoneyModal from './MobileMoneyModal';
import QRCodePaymentDialog from './QRCodePaymentDialog';
import { usePaymentActions } from './repayment/usePaymentActions';
import { useNavigate } from 'react-router-dom';

interface LoanPaymentOptionsProps {
  loan: Loan;
  onPaymentCompleted?: () => void;
}

const LoanPaymentOptions: React.FC<LoanPaymentOptionsProps> = ({ 
  loan,
  onPaymentCompleted 
}) => {
  const navigate = useNavigate();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [mobilemoneyDialogOpen, setMobileloneyDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('options');
  
  const { handlePaymentMethod } = usePaymentActions({
    loanId: loan.id,
    onMobileMoneyPayment: () => setMobileloneyDialogOpen(true),
    sfdId: loan.sfd_id
  });
  
  const handleSecurePayment = () => {
    navigate('/mobile-flow/secure-payment', { 
      state: { 
        isRepayment: true, 
        loanId: loan.id,
        sfdId: loan.sfd_id
      } 
    });
  };
  
  const closeQRDialog = () => {
    setQrDialogOpen(false);
    // If the callback exists, call it to refresh loan data
    if (onPaymentCompleted) {
      onPaymentCompleted();
    }
  };
  
  const closeMobileMoneyDialog = () => {
    setMobileloneyDialogOpen(false);
    // If the callback exists, call it to refresh loan data
    if (onPaymentCompleted) {
      onPaymentCompleted();
    }
  };
  
  const dueAmount = loan.monthly_payment || 0;
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="options">Options de paiement</TabsTrigger>
          <TabsTrigger value="history">Historique des paiements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="options" className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-1">Prochain paiement</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Montant dû:</span>
              <span className="font-bold text-xl">{dueAmount.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Échéance:</span>
              <span>
                {loan.next_payment_date 
                  ? new Date(loan.next_payment_date).toLocaleDateString()
                  : "Non disponible"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Card className="cursor-pointer hover:border-blue-300" onClick={handleSecurePayment}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Paiement sécurisé</p>
                    <p className="text-sm text-gray-500">Via compte SFD ou Mobile Money</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-green-300" 
              onClick={() => handlePaymentMethod('mobile')}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Mobile Money</p>
                    <p className="text-sm text-gray-500">Orange Money, MTN Money, Moov Money</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
            
            <Card 
              className="cursor-pointer hover:border-purple-300" 
              onClick={() => setQrDialogOpen(true)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <QrCode className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Scanner code QR en agence</p>
                    <p className="text-sm text-gray-500">Paiement en espèces à l'agence</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Historique des remboursements</h3>
            {/* Placeholder for payment history - would be replaced with actual data */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">10 000 FCFA</p>
                  <p className="text-xs text-gray-500">01/05/2023</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">Payé</Badge>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">10 000 FCFA</p>
                  <p className="text-xs text-gray-500">01/04/2023</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">Payé</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">10 000 FCFA</p>
                  <p className="text-xs text-gray-500">01/03/2023</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">Payé</Badge>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setActiveTab('options')}
          >
            Retour aux options de paiement
          </Button>
        </TabsContent>
      </Tabs>
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <QRCodePaymentDialog 
          onClose={closeQRDialog} 
          isWithdrawal={false} 
          amount={dueAmount}
        />
      </Dialog>
      
      <Dialog open={mobilemoneyDialogOpen} onOpenChange={setMobileloneyDialogOpen}>
        <DialogContent>
          <MobileMoneyModal 
            onClose={closeMobileMoneyDialog} 
            isWithdrawal={false}
            amount={dueAmount}
            loanId={loan.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanPaymentOptions;
