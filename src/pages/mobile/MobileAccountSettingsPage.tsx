
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const MobileAccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/savings')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Paramètres du compte</h1>
      </div>
      
      <div className="p-4 text-center pt-20">
        <p className="text-lg">Page des paramètres du compte à implémenter</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/mobile-flow/savings')}
        >
          Retour
        </Button>
      </div>
    </div>
  );
};

export default MobileAccountSettingsPage;
