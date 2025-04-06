
import React, { useState } from 'react';
import ContextualHeader from './ContextualHeader';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Shield } from 'lucide-react';
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
    <div className="p-2">
      <ContextualHeader />
      
      <div className="mt-3 flex justify-end">
        <div className="w-[180px]">
          <Select value={selectedSfd} onValueChange={handleSfdChange}>
            <SelectTrigger className="bg-blue-700/80 text-white border-blue-500 text-sm py-1 h-8">
              <SelectValue placeholder="Choisir une SFD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary" className="text-sm">
                <div className="flex items-center">
                  <Shield className="h-3 w-3 mr-1 text-green-600" />
                  SFD Primaire
                </div>
              </SelectItem>
              <SelectItem value="secondary" className="text-sm">
                <Shield className="h-3 w-3 mr-1 text-amber-600" />
                SFD Secondaire
              </SelectItem>
              <SelectItem value="micro" className="text-sm">
                <Shield className="h-3 w-3 mr-1 text-blue-600" />
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
