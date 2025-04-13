
import React from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdManagement } from '@/components/admin/SfdManagement';
import { Footer } from '@/components';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, UserPlus, FileText, ArrowLeft } from 'lucide-react';
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
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {/* Intégrer la fonctionnalité appropriée */}}
            >
              <UserPlus className="h-4 w-4" />
              Nouvel Admin SFD
            </Button>
            
            <Button 
              className="flex items-center gap-2 bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={() => {/* Intégrer la fonctionnalité appropriée */}}
            >
              <Building className="h-4 w-4" />
              Ajouter une SFD
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-100">
                <div className="flex items-center mb-2">
                  <Building className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium">SFDs Actives</h3>
                </div>
                <div className="text-3xl font-bold text-blue-700">12</div>
                <p className="text-sm text-blue-600 mt-1">+2 ce mois-ci</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-green-50 border-green-100">
                <div className="flex items-center mb-2">
                  <UserPlus className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">Administrateurs SFD</h3>
                </div>
                <div className="text-3xl font-bold text-green-700">28</div>
                <p className="text-sm text-green-600 mt-1">+5 ce mois-ci</p>
              </div>
              
              <div className="border rounded-lg p-4 bg-amber-50 border-amber-100">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-amber-600 mr-2" />
                  <h3 className="font-medium">Rapports en attente</h3>
                </div>
                <div className="text-3xl font-bold text-amber-700">4</div>
                <p className="text-sm text-amber-600 mt-1">Échéance cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <SfdManagement />
      </main>
      
      <Footer />
    </div>
  );
};

export default SfdManagementPage;
