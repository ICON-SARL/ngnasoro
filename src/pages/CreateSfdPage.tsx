
import React from 'react';
import { CreateCaurieSfdButton } from '@/components/sfd/CreateCaurieSfdButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import MobileLoginPage from '@/pages/MobileLoginPage';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { useAuth } from '@/hooks/useAuth';

const CreateSfdPage: React.FC = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Créer un accès SFD</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Création d'un compte administrateur SFD</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCaurieSfdButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateSfdPage;
