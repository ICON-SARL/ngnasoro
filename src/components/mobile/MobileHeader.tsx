
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
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

const MobileHeader = () => {
  const { toast } = useToast();
  const { activeSfdId, setActiveSfdId, sfdData } = useSfdDataAccess();
  
  const handleSfdChange = (value: string) => {
    setActiveSfdId(value);
    
    const selectedSfd = sfdData.find(sfd => sfd.id === value);
    const sfdName = selectedSfd?.name || 'SFD Inconnue';
    
    toast({
      title: "SFD changée",
      description: `Vous êtes maintenant connecté à ${sfdName}`,
    });
  };
  
  return (
    <div className="p-2">
      <ContextualHeader />
      
      <div className="mt-3 flex justify-end">
        <div className="w-[180px]">
          <Select value={activeSfdId || ''} onValueChange={handleSfdChange}>
            <SelectTrigger className="bg-[#0D6A51] text-white border-[#F97316]/20 text-sm py-1 h-8 hover:bg-[#0D6A51]/90">
              <SelectValue placeholder="Choisir une SFD" />
            </SelectTrigger>
            <SelectContent>
              {sfdData.map(sfd => (
                <SelectItem key={sfd.id} value={sfd.id} className="text-sm">
                  <div className="flex items-center">
                    <Shield className={`h-3 w-3 mr-1 ${
                      sfd.id === 'primary-sfd' ? 'text-[#0D6A51]' : 
                      sfd.id === 'secondary-sfd' ? 'text-[#F97316]' : 'text-blue-600'
                    }`} />
                    {sfd.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
