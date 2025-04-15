
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { SfdNavigation } from '@/components/sfd/SfdNavigation';
import LoadingSpinner from '@/components/ui/loading-spinner';

const AgencyManagementPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Rediriger vers la page des prêts après le chargement
  useEffect(() => {
    if (!loading && user) {
      console.log("Redirection vers /sfd-loans");
      navigate('/sfd-loans');
    }
  }, [loading, user, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size={40} />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Tableau de Bord SFD</h2>
          <p className="text-muted-foreground">
            Choisissez une section pour gérer votre SFD
          </p>
        </div>
        
        <div className="mb-6">
          <SfdNavigation />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Sélectionnez une des options ci-dessus pour gérer votre SFD.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AgencyManagementPage;
