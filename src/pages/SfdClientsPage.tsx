
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { ClientManagementSystem } from '@/components/sfd/ClientManagementSystem';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const SfdClientsPage = () => {
  const { isAdmin, user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: 'Authentification requise',
        description: 'Vous devez être connecté pour accéder à cette page',
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [user, loading, navigate, toast]);
  
  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#0D6A51] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Chargement en cours...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, don't render the page
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAdmin ? <SuperAdminHeader /> : <SfdHeader />}
      
      <div className="container mx-auto py-6 px-4">
        <ClientManagementSystem />
        
        {/* Error handling for common issues */}
        <div className="fixed bottom-0 right-0 p-4 space-y-4" style={{ zIndex: 100 }}>
          <div id="error-messages"></div>
        </div>
      </div>
    </div>
  );
};

export default SfdClientsPage;
