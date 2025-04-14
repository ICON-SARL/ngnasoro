
import React, { useState, useEffect } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface SfdSelectorProps {
  className?: string;
  onEmptySfds?: () => void;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ className, onEmptySfds }) => {
  const { toast } = useToast();
  const { activeSfdId, setActiveSfdId, sfdData, isLoading } = useSfdDataAccess();
  
  useEffect(() => {
    if (!isLoading && sfdData.length === 0 && onEmptySfds) {
      onEmptySfds();
    }
  }, [sfdData, isLoading, onEmptySfds]);
  
  const handleSfdChange = (value: string) => {
    setActiveSfdId(value);
    
    const selectedSfd = sfdData.find(sfd => sfd.id === value);
    const sfdName = selectedSfd?.name || 'SFD Inconnue';
    
    toast({
      title: "SFD changée",
      description: `Vous êtes maintenant connecté à ${sfdName}`,
    });
  };
  
  if (isLoading) {
    return (
      <div className={className}>
        <div className="bg-white text-gray-400 border-2 border-gray-300 px-3 py-2 h-10 rounded-lg w-full flex items-center justify-between">
          <div>Chargement des SFDs...</div>
          <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (sfdData.length === 0) {
    return (
      <div className={className}>
        <div className="bg-white text-amber-700 border-2 border-amber-300 px-3 py-2 h-10 rounded-lg w-full flex items-center justify-between">
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-2 text-amber-500" />
            <span>Aucune SFD disponible</span>
          </div>
          <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">
            Adhésion requise
          </Badge>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Select value={activeSfdId || ''} onValueChange={handleSfdChange}>
        <SelectTrigger className="bg-white text-[#0D6A51] border-2 border-[#0D6A51] px-3 py-2 h-10 rounded-lg w-full">
          <div className="flex justify-between items-center w-full">
            <SelectValue placeholder="Sélectionner SFD">
              {sfdData.find(sfd => sfd.id === activeSfdId)?.name || 'Sélectionner SFD'}
            </SelectValue>
            <ChevronDown className="h-4 w-4 ml-2 text-[#0D6A51]" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {sfdData.map(sfd => (
            <SelectItem key={sfd.id} value={sfd.id} className="text-sm">
              {sfd.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SfdSelector;
