
import React, { useState } from 'react';
import { SfdAdminDashboard } from '@/components/admin/SfdAdminDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plus, ListTodo, Settings, FileJson } from 'lucide-react';
import { MerefLoanRequestForm } from '@/components/sfd/meref/MerefLoanRequestForm';
import { MerefLoanRequestsList } from '@/components/sfd/meref/MerefLoanRequestsList';
import { MerefLoanRequestDetail } from '@/components/sfd/meref/MerefLoanRequestDetail';

const MerefLoanManagementPage = () => {
  const { user, isAdmin, isSfdAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  // Si aucun utilisateur ou pas admin/sfd-admin, refuser l'accès
  if (!user || (!isAdmin && !isSfdAdmin)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Accès non autorisé</h1>
          <p className="mt-2">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }
  
  // Gérer la navigation
  const handleSelectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setActiveTab('detail');
  };
  
  const handleBackToList = () => {
    setSelectedRequestId(null);
    setActiveTab('list');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdAdminDashboard />
      
      <div className="container mx-auto p-4 md:p-6 mt-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Demandes de Prêt MEREF</h1>
              
              <div className="flex gap-2">
                {activeTab === 'list' && (
                  <Button onClick={() => setActiveTab('new')} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nouvelle demande
                  </Button>
                )}
                
                <TabsList>
                  <TabsTrigger value="list" className="flex items-center">
                    <ListTodo className="h-4 w-4 mr-2" />
                    Demandes
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle
                  </TabsTrigger>
                  <TabsTrigger value="detail" disabled={!selectedRequestId} className="flex items-center">
                    <FileJson className="h-4 w-4 mr-2" />
                    Détails
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            
            <TabsContent value="list">
              <MerefLoanRequestsList onSelectRequest={handleSelectRequest} />
            </TabsContent>
            
            <TabsContent value="new">
              <Card>
                <CardHeader>
                  <CardTitle>Nouvelle demande de prêt MEREF</CardTitle>
                </CardHeader>
                <CardContent>
                  <MerefLoanRequestForm 
                    onSuccess={() => {
                      setActiveTab('list');
                    }} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detail">
              {selectedRequestId && (
                <MerefLoanRequestDetail 
                  requestId={selectedRequestId} 
                  onBack={handleBackToList}
                />
              )}
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres MEREF</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Interface de configuration des paramètres MEREF.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MerefLoanManagementPage;
