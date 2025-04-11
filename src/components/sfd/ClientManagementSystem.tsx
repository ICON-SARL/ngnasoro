
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientManagement } from './ClientManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { NewClientForm } from './NewClientForm';
import { UserPlus, Users, CreditCard, FileText, History } from 'lucide-react';

export interface ClientManagementSystemProps {
  sfdId?: string;
}

export const ClientManagementSystem: React.FC<ClientManagementSystemProps> = ({ sfdId }) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleAddClientSuccess = () => {
    setSheetOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion clientèle</h2>
          <p className="text-muted-foreground">
            Gérez vos clients et suivez leurs activités.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px] overflow-y-auto">
              <SheetHeader className="mb-5">
                <SheetTitle>Ajouter un nouveau client</SheetTitle>
                <SheetDescription>
                  Remplissez les informations du client ci-dessous
                </SheetDescription>
              </SheetHeader>
              <NewClientForm onSuccess={handleAddClientSuccess} />
            </SheetContent>
          </Sheet>
          
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Clients
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Comptes
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center">
            <History className="mr-2 h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="mt-0">
          <ClientManagement />
        </TabsContent>
        
        <TabsContent value="accounts" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Comptes Clients</CardTitle>
              <CardDescription>
                Gérez les comptes et produits financiers de vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  Module de gestion des comptes en cours de développement
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Transactions Clients</CardTitle>
              <CardDescription>
                Suivez les transactions et mouvements financiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  Module de suivi des transactions en cours de développement
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
