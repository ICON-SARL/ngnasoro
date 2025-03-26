
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Bell, User, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MobileHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Utilisateur';

  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-lime-200 flex items-center justify-center mr-2">
          <span className="text-black font-bold">$</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">InstingLoan</h1>
          <p className="text-xs text-white/70">Multi-SFD Platform</p>
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
