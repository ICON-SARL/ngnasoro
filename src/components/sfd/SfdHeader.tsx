
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const SfdHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">SFD Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">
            {user?.full_name || user?.email}
          </span>
          
          <nav>
            <ul className="flex gap-4">
              <li>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-primary-foreground"
                  onClick={() => navigate('/sfd')}
                >
                  Dashboard
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-primary-foreground"
                  onClick={() => navigate('/sfd/subsidy-requests')}
                >
                  Demandes de Prêt
                </Button>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-white hover:bg-primary-foreground"
                  onClick={() => signOut()}
                >
                  Déconnexion
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
