
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  MenuIcon, 
  User,
  LogOut
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { CurrentSfdBadge } from '@/components/sfd/CurrentSfdBadge';

export function AgencyHeader() {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };
  
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 bg-[#0D6A51] rounded-md flex items-center justify-center text-white font-semibold mr-2">
              M
            </div>
            <span className="font-semibold text-lg">MEREF SFD</span>
            
            {/* Badge montrant la SFD actuelle pour les admin SFD */}
            <CurrentSfdBadge />
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
