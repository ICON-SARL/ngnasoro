
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SubsidyRequestForm } from '@/components/sfd/subsidy/SubsidyRequestForm';
import { SubsidyRequestsList } from '@/components/sfd/subsidy/SubsidyRequestsList';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText } from 'lucide-react';

const MerefSubsidyRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('list');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Demandes de Prêt MEREF</h2>
          <p className="text-muted-foreground">
            Gérez vos demandes de prêt auprès du MEREF pour financer vos activités à taux réduit
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
                <SubsidyRequestsList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="new">
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle demande de prêt MEREF</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous pour soumettre une demande de prêt auprès du MEREF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubsidyRequestForm onSuccess={() => setActiveTab('list')} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MerefSubsidyRequestPage;
