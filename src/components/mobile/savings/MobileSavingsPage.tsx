
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, CreditCard, Plus, ArrowUpDown } from 'lucide-react';

const MobileSavingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-b from-lime-700 to-lime-600 text-white p-6 pt-4 pb-12 relative">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/mobile-flow/main')}
            className="text-white hover:bg-white/10 p-1"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Mes Fonds</h1>
        </div>
        
        <div className="text-center">
          <p className="text-white/90 text-sm mb-1">Balance Totale</p>
          <h2 className="text-3xl font-bold mb-2">25,000 FCFA</h2>
          <div className="flex items-center justify-center text-xs text-white/80">
            <TrendingUp className="h-3 w-3 mr-1" /> 
            <span>+5% depuis le mois dernier</span>
          </div>
        </div>
      </div>
      
      <div className="px-4 -mt-8 relative z-10 mb-5">
        <div className="bg-white rounded-xl shadow-md p-4 grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-3 flex-col"
            onClick={() => navigate('/mobile-flow/transfer')}
          >
            <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center mb-2">
              <Plus className="h-5 w-5 text-lime-600" />
            </div>
            <span className="text-sm">Dépôt</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-3 flex-col"
            onClick={() => navigate('/mobile-flow/transfer')}
          >
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-2">
              <ArrowUpDown className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm">Transfert</span>
          </Button>
        </div>
      </div>
      
      <div className="px-4">
        <h3 className="text-lg font-medium mb-3">Comptes d'épargne</h3>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-lime-600 mr-2" />
              <span className="font-medium">Compte principal</span>
            </div>
            <span className="text-xs bg-lime-100 text-lime-800 px-2 py-0.5 rounded-full">Actif</span>
          </div>
          
          <div className="mb-3">
            <div className="text-sm text-gray-500">Balance actuelle</div>
            <div className="text-xl font-semibold">25,000 FCFA</div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/mobile-flow/transactions')}
            >
              Voir transactions
            </Button>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Économisez plus, gagnez plus
          </h3>
          <p className="text-sm text-blue-700">
            Parlez à votre conseiller pour découvrir nos plans d'épargne à taux avantageux.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileSavingsPage;
