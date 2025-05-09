
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Sfd {
  id: string;
  name: string;
}

interface SfdSelectorContentProps {
  className?: string;
  activeSfdId: string | null;
  sfdData: Sfd[];
  onSfdChange: (value: string) => void;
}

const SfdSelectorContent: React.FC<SfdSelectorContentProps> = ({ 
  className, 
  activeSfdId, 
  sfdData, 
  onSfdChange 
}) => {
  return (
    <div className={className}>
      <Select value={activeSfdId || ''} onValueChange={onSfdChange}>
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

export default SfdSelectorContent;
