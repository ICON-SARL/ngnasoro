
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building, Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContextualHeader = () => {
  const { user } = useAuth();
  const { activeSfdId, sfdData, setActiveSfdId } = useSfdDataAccess();
  
  const activeSFD = sfdData.find(sfd => sfd.id === activeSfdId);
  const activeSFDName = activeSFD?.name || 'SFD Primaire';
  
  const handleMenuOpen = () => {
    const event = new CustomEvent('lovable:action', { detail: { action: 'openMenu' } });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3 shadow-md">
          <img 
            src="/lovable-uploads/2941965d-fd44-4815-bb4a-2c77549e1380.png" 
            alt="Logo SFD" 
            className="h-10 w-10 object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-white">SÔRÔ!</span>
          </h1>
          
          <div className="flex items-center mt-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-white text-sm bg-white/20 rounded-lg px-3 py-1 hover:bg-white/30 transition-colors">
                <Building className="h-3.5 w-3.5 mr-1.5 opacity-80" />
                <span>{activeSFDName}</span>
                <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl border border-gray-100 shadow-lg p-1 bg-white/95 backdrop-blur-sm">
                {sfdData.map(sfd => (
                  <DropdownMenuItem 
                    key={sfd.id}
                    className={`text-sm rounded-lg my-0.5 px-3 py-2 cursor-pointer ${sfd.id === activeSfdId ? 'font-semibold bg-gray-100' : 'hover:bg-gray-50'}`}
                    onClick={() => setActiveSfdId(sfd.id)}
                  >
                    <Building className={`h-3.5 w-3.5 mr-2 ${sfd.id === activeSfdId ? 'text-[#0D6A51]' : 'text-gray-500'}`} />
                    {sfd.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-white h-8 w-8 rounded-full bg-white/10 hover:bg-white/20">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white h-8 w-8 rounded-full bg-white/10 hover:bg-white/20" onClick={handleMenuOpen}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ContextualHeader;
