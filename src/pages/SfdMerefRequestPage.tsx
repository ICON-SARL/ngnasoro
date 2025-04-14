
import React from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { MerefFundRequestForm } from '@/components/sfd/MerefFundRequestForm';

const SfdMerefRequestPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('list');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Demandes de Financement MEREF</h2>
          <p className="text-muted-foreground">
            Soumettez vos demandes de financement auprès du MEREF pour obtenir des fonds à taux préférentiel
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="list">Mes demandes</TabsTrigger>
              <TabsTrigger value="new">Nouvelle demande</TabsTrigger>
            </TabsList>
            
            {activeTab === 'list' && (
              <Button onClick={() => setActiveTab('new')} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Nouvelle demande
              </Button>
            )}
          </div>
          
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  La liste des demandes de financement sera implémentée ici.
                </p>
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
