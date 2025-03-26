
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { 
  Bell, 
  User, 
  BarChart3, 
  Building, 
  ChevronDown,
  Shield
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
  const activeSFDName = activeSFD?.name || 'SFD non sélectionnée';

  const handleSwitchSfd = async (sfdId: string) => {
    await switchActiveSfd(sfdId);
  };

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-lime-200 flex items-center justify-center mr-2">
          <img 
            src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
            alt="Logo SFD" 
            className="h-6 w-6 object-contain"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">
            <span className="text-lime-300">N'GNA</span> SÔRÔ!
          </h1>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge className="bg-white/20 text-white text-[0.6rem] py-0 h-4 cursor-pointer hover:bg-white/30">
                  <Building className="h-2 w-2 mr-1" />
                  {activeSFDName}
                  <ChevronDown className="h-2 w-2 ml-1" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="p-2">
                  <div className="text-sm font-medium">Changer d'institution</div>
                  <div className="text-xs text-muted-foreground mb-2">Connexion sécurisée multi-SFD</div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch 
                      id="mobile-biometric" 
                      checked={biometricEnabled}
                      onCheckedChange={setBiometricEnabled}
                    />
                    <label htmlFor="mobile-biometric" className="text-xs flex items-center">
                      <Shield className="h-3 w-3 mr-1 text-[#0D6A51]" />
                      Vérification biométrique
                    </label>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {sfdData.map((sfd) => (
                  <DropdownMenuItem 
                    key={sfd.id}
                    className={sfd.id === activeSfdId ? "bg-lime-50" : ""}
                    onClick={() => handleSwitchSfd(sfd.id)}
                  >
                    <Building className="h-4 w-4 mr-2 text-lime-600" />
                    <span className="flex-1">{sfd.name}</span>
                    {sfd.id === activeSfdId && (
                      <Badge className="bg-lime-200 text-lime-800 text-[0.6rem] py-0 px-1">Actif</Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 text-white" 
          onClick={() => navigate('/solvency-engine')}
        >
          <BarChart3 className="h-5 w-5 text-lime-300" />
        </Button>
        <Bell className="h-6 w-6 text-white cursor-pointer" />
        <Avatar className="h-8 w-8 bg-white/20 border border-white/30">
          <User className="h-4 w-4 text-white" />
        </Avatar>
      </div>
    </div>
  );
};

export default ContextualHeader;
