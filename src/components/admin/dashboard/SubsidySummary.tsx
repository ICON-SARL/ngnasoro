
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight } from 'lucide-react';

export interface SubsidiesData {
  totalAmount: number;
  availableAmount: number;
  usagePercentage: number;
  approvedAmount: number;
  pendingAmount: number;
  // Add other required properties
}

interface SubsidySummaryProps {
  data: SubsidiesData;
}

export const SubsidySummary = ({ data }: SubsidySummaryProps) => {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Subventions</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs">
          <span>Voir le détail</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-6">
          <div>
            <div className="mb-1 text-sm font-medium">Total subventions allouées</div>
            <div className="text-3xl font-bold">{data.totalAmount.toLocaleString()} FCFA</div>
            <div className="text-sm text-muted-foreground mt-1">
              Disponible: {data.availableAmount.toLocaleString()} FCFA
            </div>
          </div>
          <Button className="mb-4 md:mb-0 md:self-start">
            <Plus className="mr-2 h-4 w-4" /> Demander des fonds
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Utilisation</div>
              <div className="text-sm text-muted-foreground">{data.usagePercentage}%</div>
            </div>
            <Progress value={data.usagePercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Approuvées</div>
              <div className="flex items-center gap-1">
                <div className="text-xl font-bold">{data.approvedAmount.toLocaleString()} FCFA</div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">En attente</div>
              <div className="text-xl font-bold">{data.pendingAmount.toLocaleString()} FCFA</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubsidySummary;
