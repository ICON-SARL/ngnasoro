
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { Card } from '@/components/ui/card';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import VoiceAssistant from '@/components/VoiceAssistant';

const SfdManagementPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminHeader />
      
      <div className="container mx-auto py-6 px-4">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestion des SFDs</h1>
            <p className="text-muted-foreground">
              Administration centralisée des partenaires SFD
            </p>
          </div>
          <div className="flex space-x-4">
            {/* Use default import syntax */}
            <VoiceAssistant 
              message="Cette page vous permet de gérer les institutions de microfinance. Vous pouvez voir la liste, ajouter, modifier ou suspendre des SFDs." 
              language="french"
            />
            <Button asChild>
              <Link to="/add-sfd" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une SFD
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <SfdManagement />
        </div>
      </div>
    </div>
  );
};

export default SfdManagementPage;
