
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';

interface SfdSelectorProps {
  className?: string;
}

const SfdSelector: React.FC<SfdSelectorProps> = ({ className }) => {
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
    <div className={`${className} w-full`}>
      <Select value={activeSfdId || ''} onValueChange={handleSfdChange}>
        <SelectTrigger className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors px-2 py-1 h-8 rounded-lg w-full">
          <div className="flex justify-between items-center w-full">
            <SelectValue placeholder="Sélectionner SFD">
              {sfdData.find(sfd => sfd.id === activeSfdId)?.name || 'Sélectionner SFD'}
            </SelectValue>
            <ChevronDown className="h-3 w-3 ml-1 text-white/70" />
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
