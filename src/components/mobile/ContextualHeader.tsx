
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const ContextualHeader = () => {
  const { user } = useAuth();
  const { activeSfdId, sfdData, setActiveSfdId } = useSfdDataAccess();
  
  const activeSFD = sfdData.find(sfd => sfd.id === activeSfdId);
  const activeSFDName = activeSFD?.name || 'SFD Primaire';

  return (
    <div className="flex flex-col py-4">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3 shadow-md">
          <img 
            src="/lovable-uploads/2941965d-fd44-4815-bb4a-2c77549e1380.png" 
            alt="Logo SFD" 
            className="h-10 w-10 object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-white">SÔRÔ!</span>
          </h1>
          
          <div className="flex items-center mt-1">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-white text-sm bg-white/20 rounded-lg px-3 py-1">
                <span>{activeSFDName}</span>
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sfdData.map(sfd => (
                  <DropdownMenuItem 
                    key={sfd.id}
                    className={`text-sm ${sfd.id === activeSfdId ? 'font-bold' : ''}`}
                    onClick={() => setActiveSfdId(sfd.id)}
                  >
                    {sfd.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextualHeader;
