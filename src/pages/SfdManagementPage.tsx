
import React, { useState, useEffect } from 'react';
import { SuperAdminHeader } from '@/components/SuperAdminHeader';
import { SfdManagementManager } from '@/components/admin/sfd/SfdManagementManager';
import { Footer } from '@/components';
import { SfdDetail } from '@/components/admin/sfd-management/SfdDetail';
import { useSfdManagement, SFD } from '@/hooks/useSfdManagement';
import { SfdAdminManager } from '@/components/admin/sfd/SfdAdminManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SfdManagementPage() {
  const { sfds, isLoading } = useSfdManagement();
  const [selectedSfd, setSelectedSfd] = useState<SFD | null>(null);
  const [activeTab, setActiveTab] = useState('details');

  // Update selectedSfd when sfds are loaded
  useEffect(() => {
    if (sfds?.length > 0 && !selectedSfd) {
      setSelectedSfd(sfds[0]);
    }
  }, [sfds, selectedSfd]);

  const handleSfdSelect = (sfd: SFD) => {
    setSelectedSfd(sfd);
    // Reset to details tab when selecting a new SFD
    setActiveTab('details');
  };

  const handleEdit = (sfd: SFD) => {
    console.log('Editing SFD', sfd.name);
    // Logic for editing would go here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SuperAdminHeader />
      
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Gestion des SFDs</h1>
          <p className="text-muted-foreground">
            Administrer les institutions de microfinance partenaires
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SFD List */}
          <div className="lg:col-span-1">
            <SfdManagementManager 
              onSelectSfd={handleSfdSelect}
              selectedSfdId={selectedSfd?.id}
            />
          </div>
          
          {/* SFD Details */}
          <div className="lg:col-span-2">
            {selectedSfd ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedSfd.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="details">Détails</TabsTrigger>
                      <TabsTrigger value="admins">Administrateurs</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details">
                      <SfdDetail 
                        selectedSfd={selectedSfd} 
                        onEdit={() => handleEdit(selectedSfd)} 
                      />
                    </TabsContent>
                    
                    <TabsContent value="admins">
                      <SfdAdminManager 
                        sfdId={selectedSfd.id} 
                        sfdName={selectedSfd.name} 
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-muted-foreground">Sélectionnez une SFD pour voir les détails</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
