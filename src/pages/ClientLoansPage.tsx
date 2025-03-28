
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientLoanStatus from '@/components/ClientLoanStatus';
import ClientLoanApplication from '@/components/ClientLoanApplication';
import ClientNotifications from '@/components/ClientNotifications';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Bell, Plus } from 'lucide-react';

const ClientLoansPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if user is not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes prêts</h1>
        <Button onClick={() => navigate('/loans/apply')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>
      
      <Tabs defaultValue="status" className="mb-8">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="status" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Demandes de prêt
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="status" className="mt-6">
          <ClientLoanStatus />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <ClientNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientLoansPage;
