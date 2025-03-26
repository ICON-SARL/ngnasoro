
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BellRing, 
  LogOut, 
  Settings, 
  User, 
  ChevronDown, 
  Building,
  Shield 
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

interface Agency {
  id: string;
  name: string;
  region: string;
}

export const AgencyHeader = () => {
  const [activeAgency, setActiveAgency] = useState<Agency>({
    id: '1',
    name: 'Agence Bamako',
    region: 'Bamako'
  });
  
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  
  const mockAgencies: Agency[] = [
    { id: '1', name: 'Agence Bamako', region: 'Bamako' },
    { id: '2', name: 'Agence Sikasso', region: 'Sikasso' },
    { id: '3', name: 'Agence Ségou', region: 'Ségou' },
    { id: '4', name: 'Agence Kayes', region: 'Kayes' }
  ];
  
  const handleSwitchAgency = (agency: Agency) => {
    setActiveAgency(agency);
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
            <span className="font-medium text-lg">
              <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
            </span>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="bg-[#0D6A51]/10 text-[#0D6A51] px-2 py-1 rounded text-xs font-medium ml-2 flex items-center cursor-pointer">
                <Building className="h-3 w-3 mr-1" />
                {activeAgency.name}
                <ChevronDown className="h-3 w-3 ml-1" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <div className="p-2">
                <div className="text-sm font-medium">Changer d'agence</div>
                <div className="text-xs text-muted-foreground mb-2">Connexion sécurisée</div>
                <div className="flex items-center space-x-2 mb-2">
                  <Switch 
                    id="agency-biometric" 
                    checked={biometricEnabled}
                    onCheckedChange={setBiometricEnabled}
                  />
                  <label htmlFor="agency-biometric" className="text-xs flex items-center">
                    <Shield className="h-3 w-3 mr-1 text-[#0D6A51]" />
                    Vérification biométrique
                  </label>
                </div>
              </div>
              <DropdownMenuSeparator />
              {mockAgencies.map(agency => (
                <DropdownMenuItem 
                  key={agency.id}
                  className={agency.id === activeAgency.id ? "bg-[#0D6A51]/10" : ""}
                  onClick={() => handleSwitchAgency(agency)}
                >
                  <Building className="h-4 w-4 mr-2 text-[#0D6A51]" />
                  <span className="flex-1">{agency.name}</span>
                  {agency.id === activeAgency.id && (
                    <Badge className="bg-[#0D6A51] text-white text-[0.6rem] py-0 px-1">Actif</Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/agency-dashboard" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Dashboard
          </Link>
          <Link to="/loans" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Prêts
          </Link>
          <Link to="/clients" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Clients
          </Link>
          <Link to="/transactions" className="text-sm font-medium hover:text-[#0D6A51] transition-colors">
            Transactions
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <BellRing className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="hidden md:flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
              <User className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-medium">Amadou Traoré</div>
              <div className="text-xs text-muted-foreground">agent@bamako.sfd</div>
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
