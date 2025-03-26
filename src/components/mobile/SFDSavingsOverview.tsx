
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, ArrowUpRight, ArrowDownRight, Eye, EyeOff, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SFDSavingsOverview = () => {
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const refreshBalance = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
    }, 1500);
  };
  
  const toggleVisibility = () => {
    setIsHidden(!isHidden);
  };
  
  return (
    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center">
            Aperçu compte épargne
            <Badge className="ml-2 bg-[#0D6A51]/10 text-[#0D6A51] text-xs border-0">
              <Building className="h-3 w-3 mr-1" />
              SFD Nyèsigiso
            </Badge>
          </h3>
          <Button variant="ghost" size="icon" onClick={toggleVisibility} className="h-7 w-7">
            {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 p-3 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-gray-600">Dépôts</p>
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              {isHidden ? '•••••' : '+125.000 FCFA'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Derniers 3 mois</p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-xl">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm text-gray-600">Intérêts</p>
              <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
                <ArrowUpRight className="h-3 w-3 text-amber-600" />
              </div>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              {isHidden ? '•••••' : '+3.750 FCFA'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Taux 3% annuel</p>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Solde total épargne</p>
              <p className="text-lg font-semibold">
                {isHidden ? '••••••••' : '128.750 FCFA'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshBalance}
              disabled={isUpdating}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>
        </div>
        
        <Button 
          className="mt-3 w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white py-2 rounded-xl font-medium transition-colors"
          onClick={() => navigate('/mobile-flow/multi-sfd')}
        >
          Voir tous mes comptes SFD
        </Button>
      </CardContent>
    </Card>
  );
};

export default SFDSavingsOverview;
