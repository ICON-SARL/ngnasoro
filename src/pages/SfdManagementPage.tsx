
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { Footer } from '@/components';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SfdManagementPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2" 
              onClick={() => navigate('/super-admin-dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
            <h2 className="text-2xl font-bold">Gestion des SFDs</h2>
            <p className="text-muted-foreground">
              Administrez les institutions de microfinance partenaires et leurs comptes administrateurs
            </p>
          </div>
        </div>
        
        <SfdManagement />
      </main>
      
      <Footer />
    </div>
  );
};

export default SfdManagementPage;
