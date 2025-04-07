
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  CreditCard, 
  Users, 
  FileText, 
  Settings,
  Bell,
  LogOut
} from 'lucide-react';

export const SfdHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-xl text-green-600">SFD Portal</div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/sfd/dashboard')}>
              <Home className="h-4 w-4 mr-2" />
              Tableau de Bord
            </Button>
            
            <Button variant="ghost" onClick={() => navigate('/sfd/loans')}>
              <CreditCard className="h-4 w-4 mr-2" />
              Prêts
            </Button>
            
            <Button variant="ghost" onClick={() => navigate('/sfd/clients')}>
              <Users className="h-4 w-4 mr-2" />
              Clients
            </Button>
            
            <Button variant="ghost" onClick={() => navigate('/sfd/subsidy-requests')}>
              <FileText className="h-4 w-4 mr-2" />
              Prêts MEREF
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
