import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSfdClientManagement } from '@/hooks/useSfdClientManagement';
import { DataPagination } from '@/components/ui/data-pagination';
import { Loader2, UserPlus, Filter, Search, RefreshCw } from 'lucide-react';
import NewClientModal from './client-management/NewClientModal';
import { useNavigate } from 'react-router-dom';

export const ClientManagement = () => {
  const navigate = useNavigate();
  const {
    clients,
    totalClients,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    refetch
  } = useSfdClientManagement();
  
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  // Define columns for the data table
  const columns = [
    {
      header: 'Nom complet',
      accessorKey: 'full_name',
      cell: (info: any) => <span className="font-medium">{info.getValue()}</span>
    },
    {
      header: 'Email',
      accessorKey: 'email',
    },
    {
      header: 'Téléphone',
      accessorKey: 'phone',
    },
    {
      header: 'Statut',
      accessorKey: 'status',
      cell: (info: any) => {
        const status = info.getValue();
        let statusClass = '';
        
        switch (status) {
          case 'validated':
            statusClass = 'bg-green-100 text-green-800';
            break;
          case 'pending':
            statusClass = 'bg-amber-100 text-amber-800';
            break;
          case 'rejected':
            statusClass = 'bg-red-100 text-red-800';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800';
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
            {status === 'validated' ? 'Validé' : 
             status === 'pending' ? 'En attente' : 
             status === 'rejected' ? 'Rejeté' : status}
          </span>
        );
      }
    },
    {
      header: 'Action',
      cell: (info: any) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            navigate(`/sfd-clients/${info.row.original.id}`);
          }}
        >
          Détails
        </Button>
      )
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInputValue);
  };

  const handleOpenNewClientModal = () => {
    setIsNewClientModalOpen(true);
  };

  const handleClientCreated = () => {
    setIsNewClientModalOpen(false);
    refetch();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Gestion des Clients</h2>
            {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              onClick={handleOpenNewClientModal}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Ajouter un client
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Liste des clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un client..."
                    className="pl-8"
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="outline">
                  Rechercher
                </Button>
              </form>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter || 'all'}
                  onValueChange={(value) => setStatusFilter(value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="validated">Validé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetch()}
                  title="Actualiser"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <DataTable
                columns={columns}
                data={clients}
                isLoading={isLoading}
                noResultsMessage="Aucun client trouvé"
              />
            </div>

            <DataPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalClients}
              pageSize={itemsPerPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={setItemsPerPage}
              pageSizeOptions={[10, 20, 30, 50, 100]}
              showPageSizeSelector={true}
              showItemsCount={true}
              className="mt-4"
            />
          </CardContent>
        </Card>
      </div>

      {/* New Client Modal */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onClientCreated={handleClientCreated}
      />
    </>
  );
};
