
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import { ArrowRight, CreditCard, Wallet, User, Home } from 'lucide-react';

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Bonjour, {user?.user_metadata?.full_name || 'Client'}</h1>
        
        <div className="mb-6">
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Mon compte</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm">Solde disponible</p>
                  <p className="text-xl font-semibold">150,000 FCFA</p>
                </div>
                <Button 
                  variant="outline"
                  className="text-[#0D6A51] border-[#0D6A51]"
                  onClick={() => navigate('/mobile-flow/payment')}
                >
                  Voir détails
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-lg font-semibold mb-3">Services</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/mobile-flow/loans')}>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#0D6A51]/10 flex items-center justify-center mb-2">
                <CreditCard className="h-6 w-6 text-[#0D6A51]" />
              </div>
              <span className="text-sm font-medium">Prêts</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/mobile-flow/my-loans')}>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#0D6A51]/10 flex items-center justify-center mb-2">
                <Wallet className="h-6 w-6 text-[#0D6A51]" />
              </div>
              <span className="text-sm font-medium">Mes prêts</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/mobile-flow/payment')}>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#0D6A51]/10 flex items-center justify-center mb-2">
                <ArrowRight className="h-6 w-6 text-[#0D6A51]" />
              </div>
              <span className="text-sm font-medium">Paiements</span>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/mobile-flow/account')}>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#0D6A51]/10 flex items-center justify-center mb-2">
                <User className="h-6 w-6 text-[#0D6A51]" />
              </div>
              <span className="text-sm font-medium">Compte</span>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Activités récentes</h2>
          <Card className="mb-3">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Paiement</p>
                  <p className="text-sm text-gray-500">Il y a 2 jours</p>
                </div>
              </div>
              <p className="font-semibold">-25,000 FCFA</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Prêt approuvé</p>
                  <p className="text-sm text-gray-500">Il y a 5 jours</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">+100,000 FCFA</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileMainPage;
