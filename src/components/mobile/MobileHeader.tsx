
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Bell, User, BarChart3, Building, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MobileHeader = () => {
  const { user } = useAuth();
  const { sfdData, activeSfdId, switchActiveSfd } = useSfdDataAccess();
  const navigate = useNavigate();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Utilisateur';
  const activeSFD = sfdData.find(sfd => sfd.id === activeSfdId)?.name || 'SFD non sélectionnée';

  const handleSwitchSfd = async (sfdId: string) => {
    await switchActiveSfd(sfdId);
  };

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-lime-200 flex items-center justify-center mr-2">
          <span className="text-black font-bold">$</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">InstingLoan</h1>
          <div className="flex items-center">
            <p className="text-xs text-white/70">Multi-SFD Platform</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge className="ml-1 bg-white/20 text-white text-[0.6rem] py-0 h-4 cursor-pointer hover:bg-white/30">
                  <Building className="h-2 w-2 mr-1" />
                  {activeSFD}
                  <ChevronDown className="h-2 w-2 ml-1" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {sfdData.map((sfd) => (
                  <DropdownMenuItem 
                    key={sfd.id}
                    className={sfd.id === activeSfdId ? "bg-lime-50" : ""}
                    onClick={() => handleSwitchSfd(sfd.id)}
                  >
                    <Building className="h-4 w-4 mr-2 text-lime-600" />
                    {sfd.name}
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
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 text-white" 
          onClick={() => navigate('/loan-system')}
        >
          <span className="text-xs text-lime-300">Prêts</span>
        </Button>
        <Bell className="h-6 w-6 text-white" />
        <Avatar className="h-8 w-8 bg-white/20 border border-white/30">
          <User className="h-4 w-4 text-white" />
        </Avatar>
      </div>
    </div>
  );
};

export default MobileHeader;
