
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { 
  Bell, 
  User, 
  BarChart3, 
  Building, 
  ChevronDown,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ContextualHeader = () => {
  const { user } = useAuth();
  const { sfdData, activeSfdId, switchActiveSfd } = useSfdDataAccess();
  const navigate = useNavigate();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Utilisateur';
  const activeSFD = sfdData.find(sfd => sfd.id === activeSfdId);
  const activeSFDName = activeSFD?.name || 'SFD Primaire';

  const handleSwitchSfd = async (sfdId: string) => {
    await switchActiveSfd(sfdId);
  };

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
            <Badge className="bg-white/20 text-white text-[0.6rem] py-0 h-4">
              <Building className="h-2 w-2 mr-1" />
              {activeSFDName}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 text-white relative" 
          onClick={() => navigate('/mobile-flow/home-loan')}
        >
          <RefreshCw className="h-5 w-5 text-[#FFAB2E]" />
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
        </Button>
        <Bell className="h-6 w-6 text-white cursor-pointer relative">
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
        </Bell>
        <Avatar className="h-8 w-8 bg-white/20 border border-white/30" onClick={() => navigate('/mobile-flow/profile')}>
          <User className="h-4 w-4 text-white" />
        </Avatar>
      </div>
    </div>
  );
};

export default ContextualHeader;
