
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, CreditCard, ArrowUpDown, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MobileNavigation from '@/components/MobileNavigation';
import MobileHeader from './MobileHeader';

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };
  
  return (
    <div className="pb-16">
      <MobileHeader title="Accueil" onMenuToggle={handleMenuToggle} />
      
      <div className="px-4 py-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Actions rapides</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => navigate('/mobile-flow/funds-management')}
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
              <span className="text-sm">Transfert</span>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => navigate('/mobile-flow/loans')}
              >
                <CreditCard className="h-5 w-5" />
              </Button>
              <span className="text-sm">Prêts</span>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center py-10 bg-gray-50 rounded-lg mb-6">
          <Wallet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Bienvenue dans votre espace financier</h3>
          <p className="text-sm text-gray-500 mb-4 px-6">
            Accédez facilement à vos prêts et gérez vos fonds en toute sécurité.
          </p>
          <Button 
            variant="outline" 
            className="text-[#0D6A51] border-[#0D6A51]"
            onClick={() => navigate('/mobile-flow/sfd-selector')}
          >
            Explorer les SFD <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default MobileMainPage;
