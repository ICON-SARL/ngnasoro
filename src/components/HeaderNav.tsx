
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { User, LogOut, CreditCard, Home, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CurrentSfdBadge } from '@/components/sfd/CurrentSfdBadge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';

export function HeaderNav() {
  const { user, signOut, isAdmin, isSfdAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-[#0D6A51] rounded-md flex items-center justify-center text-white font-semibold mr-2">
              N
            </div>
            <span className="font-semibold text-lg">N'gna Sôrô!</span>
            
            {isSfdAdmin && <CurrentSfdBadge />}
          </div>
          
          <div className="hidden md:flex ml-8 space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" /> 
              Accueil
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
              <Wallet className="h-4 w-4 mr-2" />
              Transactions
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => navigate('/loans')}>
              <CreditCard className="h-4 w-4 mr-2" />
              Prêts
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt={user.user_metadata?.full_name || "Profil"} 
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-medium">
                {user?.user_metadata?.full_name || user?.email || "Utilisateur"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default HeaderNav;
