
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const MobileWelcomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="pt-6 px-4 pb-4">
          <div className="text-center mb-6">
            <div className="h-20 w-20 bg-green-50 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#0D6A51" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Bienvenue sur Ngnasoro</h1>
            <p className="text-gray-600 mt-2">
              {user?.user_metadata?.full_name || 'Cher utilisateur'}, 
              nous sommes ravis de vous revoir.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/mobile-flow/main')}
              className="w-full h-12 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              Accéder à mon espace
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/mobile-flow/sfd-adhesion')}
              className="w-full h-12 border-[#0D6A51] text-[#0D6A51] hover:bg-[#0D6A51]/10"
            >
              Demander une adhésion SFD
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>© 2025 Ngnasoro. Tous droits réservés.</p>
      </div>
    </div>
  );
};

export default MobileWelcomePage;
