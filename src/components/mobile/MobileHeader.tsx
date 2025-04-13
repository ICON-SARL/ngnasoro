
import React, { useState } from 'react';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Shield, Menu, ChevronDown } from 'lucide-react';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useToast } from '@/hooks/use-toast';

const MobileHeader = () => {
  const { toast } = useToast();
  const { activeSfdId, setActiveSfdId, sfdData } = useSfdDataAccess();
  const [isOpen, setIsOpen] = useState(false);
  
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
    <div className="bg-white">
      <div className="bg-[#0D6A51] px-4 py-4 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm">
              <img 
                src="/lovable-uploads/11c7df4b-bda8-4b49-b653-6ba0e7d3abad.png" 
                alt="N'GNA SÔRÔ! Logo" 
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold tracking-tight">
                N'GNA <span className="text-[#F97316]">SÔRÔ!</span>
              </h1>
              <p className="text-yellow-300 text-xs font-medium">CVECA-ON</p>
            </div>
          </div>
          
          <button 
            className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* SFD Selector positioned below the logo */}
        <div className="mt-3 relative">
          <Select value={activeSfdId || ''} onValueChange={handleSfdChange}>
            <SelectTrigger className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors pl-3 pr-2 py-1 h-auto rounded-lg">
              <div className="flex justify-between items-center w-full">
                <SelectValue placeholder="Choisir une SFD" />
                <ChevronDown className="h-4 w-4 ml-1 text-white/70" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
              {sfdData.map(sfd => (
                <SelectItem key={sfd.id} value={sfd.id} className="flex items-center">
                  <div className="flex items-center">
                    <Shield className={`h-4 w-4 mr-2 ${
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
