
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, QrCode, Smartphone, CreditCard } from 'lucide-react';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileMenu from '@/components/mobile/MobileMenu';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/formatters';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const { getBalance } = useTransactions(user?.id || '', '');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const accountBalance = await getBalance();
          setBalance(accountBalance);
        } catch (error) {
          console.error('Error fetching balance:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchBalance();
  }, [user, getBalance]);
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader />
      
      <div className="px-4 py-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" className="p-1" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Paiement</h1>
        </div>
        
        <Card className="mb-6 bg-[#0D6A51] text-white">
          <CardContent className="p-4">
            <h2 className="text-sm font-medium mb-2 opacity-80">Solde disponible</h2>
            <div className="text-2xl font-bold">
              {isLoading ? 
                <div className="h-8 w-32 bg-white/20 animate-pulse rounded"></div> : 
                formatCurrency(balance)
              }
            </div>
          </CardContent>
        </Card>
        
        <h2 className="text-lg font-semibold mb-4">Options de paiement</h2>
        
        <div className="grid gap-4">
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Scanner un QR code</h3>
                <p className="text-sm text-gray-500">Payer à partir d'un code QR</p>
              </div>
              <Button variant="ghost" className="ml-auto" onClick={() => navigate('/mobile-flow/payment/scan')}>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Mobile Money</h3>
                <p className="text-sm text-gray-500">Payer avec Mobile Money</p>
              </div>
              <Button variant="ghost" className="ml-auto" onClick={() => navigate('/mobile-flow/payment/mobile-money')}>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Payer un prêt</h3>
                <p className="text-sm text-gray-500">Remboursement de prêt</p>
              </div>
              <Button variant="ghost" className="ml-auto" onClick={() => navigate('/mobile-flow/my-loans')}>
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileMenu />
    </div>
  );
};

export default PaymentPage;
