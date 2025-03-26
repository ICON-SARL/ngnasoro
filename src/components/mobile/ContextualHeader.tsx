
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

const ContextualHeader = () => {
  const { user } = useAuth();
  const { activeSfdId, sfdData } = useSfdDataAccess();
  const navigate = useNavigate();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Utilisateur';
  const activeSFD = sfdData.find(sfd => sfd.id === activeSfdId);
  const activeSFDName = activeSFD?.name || 'SFD Primaire';

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-[#FFAB2E]/80 flex items-center justify-center mr-2">
          <img 
            src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
            alt="Logo SFD" 
            className="h-6 w-6 object-contain"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-white">SÔRÔ!</span>
          </h1>
          <div className="flex items-center">
            <span className="text-white/80 text-xs">{activeSFDName}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <Bell className="h-6 w-6 text-white cursor-pointer relative">
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
        </Bell>
      </div>
    </div>
  );
};

export default ContextualHeader;
