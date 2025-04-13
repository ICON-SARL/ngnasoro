
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
