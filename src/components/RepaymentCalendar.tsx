import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RepaymentCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const handleDateSelect = (newDate) => {
    setDate(newDate);
    
    toast({
      title: "Date sélectionnée",
      description: `Vous avez sélectionné la date du ${newDate.toLocaleDateString()}.`,
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Calendrier de Remboursement
        </CardTitle>
        <CardDescription>
          Suivez vos échéances de remboursement en un coup d'œil
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="border rounded-md p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Prochaines échéances
          </h3>
          <div className="flex items-center justify-between">
            <span>15 Mai 2023</span>
            <Badge variant="secondary">
              <Check className="h-3 w-3 mr-1" />
              Payé
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>15 Juin 2023</span>
            <Badge variant="outline" className="text-orange-500 font-medium">
              <AlertCircle className="h-3 w-3 mr-1" />
              En attente
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
