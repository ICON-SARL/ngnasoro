
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ClientsManagement from '@/components/sfd/ClientsManagement';
import { useSfdClients } from '@/hooks/useSfdClients';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';

const ClientsPage = () => {
  const { clients, isLoading } = useSfdClients();
  
  // Count clients by status
  const pendingCount = !isLoading ? clients.filter(c => c.status === 'pending').length : 0;
  const validatedCount = !isLoading ? clients.filter(c => c.status === 'validated').length : 0;
  const rejectedCount = !isLoading ? clients.filter(c => c.status === 'rejected').length : 0;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Gestion des Clients SFD</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{isLoading ? '...' : clients.length}</div>
              <div className="p-2 bg-[#0D6A51]/10 rounded-full">
                <Users className="h-5 w-5 text-[#0D6A51]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Validés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{isLoading ? '...' : validatedCount}</div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{isLoading ? '...' : pendingCount}</div>
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rejetés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{isLoading ? '...' : rejectedCount}</div>
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ClientsManagement />
    </div>
  );
};

export default ClientsPage;
