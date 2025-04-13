
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

const ContextualHeader = () => {
  const { user } = useAuth();
  const { activeSfdId, sfdData } = useSfdDataAccess();
  
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
          <div className="flex items-center">
            <span className="text-white/90 text-sm">{activeSFDName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextualHeader;
