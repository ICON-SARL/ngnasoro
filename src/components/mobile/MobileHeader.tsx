
import React, { useState } from 'react';
import ContextualHeader from './ContextualHeader';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Shield, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const MobileHeader = () => {
  const { toast } = useToast();
  const [selectedSfd, setSelectedSfd] = useState('primary');
  
  const handleSfdChange = (value: string) => {
    setSelectedSfd(value);
    toast({
      title: "SFD changée",
      description: `Vous êtes maintenant connecté à ${value === 'primary' ? 'SFD Primaire' : 
        value === 'secondary' ? 'SFD Secondaire' : 'SFD Micro-Finance'}`,
    });
  };
  
  return (
    <div className="flex flex-col">
      <ContextualHeader />
      
      <div className="mt-3 flex justify-between items-center">
        <div className="text-white">
          <h3 className="text-lg font-medium">Choix SFD</h3>
          <p className="text-xs opacity-80">Sélectionnez votre institution</p>
        </div>
        
        <div className="w-[180px]">
          <Select value={selectedSfd} onValueChange={handleSfdChange}>
            <SelectTrigger className="bg-blue-700 text-white border-blue-500">
              <SelectValue placeholder="Choisir une SFD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary" className="flex items-center">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  SFD Primaire
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Principale
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="secondary">
                <Shield className="h-4 w-4 mr-2 text-amber-600" />
                SFD Secondaire
              </SelectItem>
              <SelectItem value="micro">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                SFD Micro-Finance
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
