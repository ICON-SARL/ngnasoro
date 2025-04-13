
import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';

const ContextualHeader = () => {
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
    <div className="bg-[#0D6A51] py-4 px-4 rounded-b-2xl shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
            <img 
              src="/lovable-uploads/11c7df4b-bda8-4b49-b653-6ba0e7d3abad.png" 
              alt="N'GNA SÔRÔ! Logo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              N'GNA <span className="text-[#F97316]">SÔRÔ!</span>
            </h1>
          </div>
        </div>
        
        <button className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      {/* SFD Selector positioned below the logo */}
      <div className="mt-2">
        <Select value={activeSfdId || ''} onValueChange={handleSfdChange}>
          <SelectTrigger className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors pl-3 pr-2 py-1 h-auto rounded-lg w-full">
            <div className="flex justify-between items-center w-full">
              <SelectValue placeholder="Sélectionner SFD">
                {sfdData.find(sfd => sfd.id === activeSfdId)?.name || 'Sélectionner SFD'}
              </SelectValue>
              <ChevronDown className="h-4 w-4 ml-1 text-white/70" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
            {sfdData.map(sfd => (
              <SelectItem key={sfd.id} value={sfd.id}>
                {sfd.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ContextualHeader;
