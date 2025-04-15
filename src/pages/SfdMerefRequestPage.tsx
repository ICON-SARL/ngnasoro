
import React, { useState } from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MerefRequestHeader } from '@/components/sfd/MerefRequestHeader';
import { MerefRequestList } from '@/components/sfd/MerefRequestList';
import { MerefFundRequestForm } from '@/components/sfd/MerefFundRequestForm';

const SfdMerefRequestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('list');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="list">Mes demandes</TabsTrigger>
              <TabsTrigger value="new">Nouvelle demande</TabsTrigger>
            </TabsList>
            
            {activeTab === 'list' && (
              <MerefRequestHeader 
                onNewRequest={() => setActiveTab('new')} 
              />
            )}
          </div>
          
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <MerefRequestList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="new">
            <MerefFundRequestForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SfdMerefRequestPage;
