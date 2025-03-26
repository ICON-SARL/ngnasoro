
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, DollarSign } from 'lucide-react';

interface QuickAccessCardProps {
  onAction: (action: string) => void;
}

const QuickAccessCard = ({ onAction }: QuickAccessCardProps) => {
  return (
    <div className="mx-4 -mt-2">
      <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-1">Accès rapide</p>
          <p className="text-xs text-gray-500 mb-3">100 000 FCFA disponible</p>
          
          <Button 
            onClick={() => onAction('Float me cash')} 
            variant="outline"
            className="w-full justify-between bg-gray-50 hover:bg-gray-100 border-0 rounded-xl py-5 mb-2"
          >
            <div className="flex items-center">
              <div className="bg-black text-white p-2 rounded-full mr-3">
                <DollarSign className="h-5 w-5" />
              </div>
              <span>Obtenir un prêt rapide</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAccessCard;
