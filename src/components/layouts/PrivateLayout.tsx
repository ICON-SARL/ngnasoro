
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PrivateLayoutProps {
  children: React.ReactNode;
}

const PrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const { user, loading, refreshSession } = useAuth();
  
  useEffect(() => {
    // Log the authentication state for debugging
    console.log('PrivateLayout auth state:', { user, loading });
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Loader size="lg" />
        <span className="ml-3 text-gray-600 mt-3">Chargement de votre session...</span>
        
        {/* Ajout d'un bouton pour rafraîchir manuellement si nécessaire */}
        <Button 
          variant="outline"
          className="mt-4"
          onClick={() => refreshSession()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Rafraîchir la session
        </Button>
      </div>
    );
  }

  if (!user) {
    console.log('PrivateLayout: No user detected, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('PrivateLayout: User authenticated, rendering protected content');
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default PrivateLayout;
