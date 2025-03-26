
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

const GoalsSection = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2">Acheter une moto</h3>
          <p className="text-xs text-gray-600 mb-1">• Dans 4 mois</p>
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-medium">125,000 FCFA</p>
            <Badge className="bg-[#0D6A51] text-xs">45%</Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-[#0D6A51] h-1 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border border-dashed bg-transparent flex items-center justify-center">
        <Button variant="ghost" className="h-full w-full flex flex-col items-center gap-2 text-gray-500">
          <Plus className="h-5 w-5" />
          <span className="text-xs">Ajouter un objectif</span>
        </Button>
      </Card>
    </div>
  );
};

export default GoalsSection;
