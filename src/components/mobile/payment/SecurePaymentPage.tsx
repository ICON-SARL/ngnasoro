
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, LockKeyhole, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SecurePaymentPageProps {
  onPaymentSubmit: (data: { recipient: string; amount: number; note: string }) => Promise<void>;
}

const SecurePaymentPage: React.FC<SecurePaymentPageProps> = ({ onPaymentSubmit }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  
  // In a real app, we would get these from the previous page
  const paymentData = {
    recipient: 'John Doe',
    amount: 5000,
    note: 'Payment for services'
  };

  const handleVerify = async () => {
    if (pin.length !== 4) return;
    
    setIsVerifying(true);
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVerified(true);
      
      // Wait a moment to show success, then submit payment
      setTimeout(async () => {
        await onPaymentSubmit(paymentData);
        navigate('/mobile-flow/main');
      }, 1000);
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="pb-20 font-montserrat">
      <div className="bg-white py-2 sticky top-0 z-10 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-4" 
          onClick={() => navigate('/mobile-flow/payment')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>
      
      <div className="px-4 pt-4 flex flex-col items-center">
        <h1 className="text-xl font-bold text-[#0D6A51] mb-6">Confirm Payment</h1>
        
        <Card className="w-full mb-8">
          <CardContent className="py-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Destinataire:</span>
                <span className="font-medium">{paymentData.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Montant:</span>
                <span className="font-medium">{paymentData.amount.toLocaleString()} FCFA</span>
              </div>
              {paymentData.note && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Note:</span>
                  <span className="font-medium">{paymentData.note}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {verified ? (
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-green-600">Paiement vérifié!</p>
            <p className="text-sm text-gray-500 mt-1">Redirection en cours...</p>
          </div>
        ) : (
          <>
            <div className="h-16 w-16 rounded-full bg-[#0D6A51]/10 flex items-center justify-center mb-4">
              <LockKeyhole className="h-8 w-8 text-[#0D6A51]" />
            </div>
            
            <p className="text-center text-gray-600 mb-6">
              Entrez votre code PIN à 4 chiffres pour confirmer le paiement
            </p>
            
            <div className="w-full max-w-xs mb-8">
              <Label htmlFor="pin" className="sr-only">PIN Code</Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                className="text-center text-xl"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
              />
            </div>
            
            <Button 
              onClick={handleVerify}
              disabled={pin.length !== 4 || isVerifying}
              className="w-full max-w-xs bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Vérification...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SecurePaymentPage;
