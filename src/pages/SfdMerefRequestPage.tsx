
import React from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { MerefFundRequestForm } from '@/components/sfd/MerefFundRequestForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMerefFundRequests } from '@/hooks/useMerefFundRequests';
import { formatDateToLocale } from '@/utils/dateUtils';

const SfdMerefRequestPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState('list');
  const { fundRequests, isLoading, refetch } = useMerefFundRequests();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejetée</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Complétée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
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
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : fundRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Vous n'avez pas encore de demande de financement.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Objet</TableHead>
                          <TableHead>Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fundRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{formatDateToLocale(request.created_at)}</TableCell>
                            <TableCell>{request.amount.toLocaleString()} FCFA</TableCell>
                            <TableCell className="max-w-xs truncate">{request.purpose}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
