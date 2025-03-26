
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BellRing, 
  LogOut, 
  Settings, 
  User, 
  MessageCircle, 
  ChevronDown, 
  Building,
  Shield,
  CreditCard
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface SFD {
  id: string;
  name: string;
  region: string;
}

export const SuperAdminHeader = () => {
  const [activeSfd, setActiveSfd] = useState<SFD>({
    id: '1',
    name: 'N\'GNA SÔRÔ!',
    region: 'Bamako'
  });
  
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  
  const mockSfds: SFD[] = [
    { id: '1', name: 'N\'GNA SÔRÔ!', region: 'Bamako' },
    { id: '2', name: 'Micro Finance Mali', region: 'Sikasso' },
    { id: '3', name: 'Crédit Rural', region: 'Ségou' },
    { id: '4', name: 'Mali Finance', region: 'Kayes' }
  ];
  
  const handleSwitchSfd = (sfd: SFD) => {
    setActiveSfd(sfd);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
              alt="NGNA SÔRÔ! Logo" 
              className="h-8"
            />
            <div className="flex flex-col">
              <span className="font-medium text-lg">
                <span className="text-[#FFAB2E]">MEREF</span> 
                <span className="text-[#0D6A51]">-Mali</span>
              </span>
              <span className="text-xs text-gray-500">
                Mécanisme de Refinancement et de Garantie
              </span>
            </div>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="bg-[#FFAB2E]/10 text-[#FFAB2E] px-2 py-1 rounded text-xs font-medium ml-2 flex items-center cursor-pointer">
                <Building className="h-3 w-3 mr-1" />
                Super Admin - MEREF
                <ChevronDown className="h-3 w-3 ml-1" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <div className="text-sm font-medium">Gestion des institutions</div>
                <div className="text-xs text-muted-foreground mb-2">Supervision des SFDs subventionnés</div>
                <div className="flex items-center space-x-2 mb-2">
                  <Switch 
                    id="biometric" 
                    checked={biometricEnabled}
                    onCheckedChange={setBiometricEnabled}
                  />
                  <label htmlFor="biometric" className="text-xs flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-[#0D6A51]" />
                    Vérification biométrique
                  </label>
                </div>
              </div>
              <DropdownMenuSeparator />
              {mockSfds.map(sfd => (
                <DropdownMenuItem 
                  key={sfd.id}
                  className={sfd.id === activeSfd.id ? "bg-[#FFAB2E]/10" : ""}
                  onClick={() => handleSwitchSfd(sfd)}
                >
                  <Building className="h-4 w-4 mr-2 text-[#0D6A51]" />
                  <span className="flex-1">{sfd.name}</span>
                  {sfd.id === activeSfd.id && (
                    <Badge className="bg-[#FFAB2E] text-[0.6rem] py-0 px-1">Actif</Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/super-admin" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Tableau de bord
          </Link>
          <Link to="/agency-dashboard" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            SFDs
          </Link>
          <Link to="/loan-system" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Subventions
          </Link>
          <Link to="/support" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Support
          </Link>
          <Link to="/security" className="text-sm font-medium hover:text-[#FFAB2E] transition-colors">
            Sécurité
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <BellRing className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="hidden md:flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-[#FFAB2E]/10 flex items-center justify-center text-[#FFAB2E]">
              <User className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-medium">Admin MEREF</div>
              <div className="text-xs text-muted-foreground">admin@meref-mali.ml</div>
            </div>
          </div>
          
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
