
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SfdClient } from '@/types/sfdClients';
import { Eye, Users, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface ClientsListProps {
  clients: SfdClient[];
  isLoading: boolean;
  onClientSelect: (clientId: string) => void;
}

const ClientsList: React.FC<ClientsListProps> = ({ 
  clients, 
  isLoading,
  onClientSelect
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Suspendu</Badge>;
      case 'validated':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Validé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center py-12"
      >
        <div className="animate-spin h-8 w-8 border-4 border-[#0D6A51] border-t-transparent rounded-full"></div>
      </motion.div>
    );
  }

  if (clients.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground border rounded-md"
      >
        <Users className="h-8 w-8 mb-2" />
        <h3 className="font-medium">Aucun client trouvé</h3>
        <p className="text-sm">Ajoutez de nouveaux clients ou modifiez votre recherche</p>
      </motion.div>
    );
  }

  const handleViewDetails = (e: React.MouseEvent, clientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("Voir les détails du client:", clientId);
    onClientSelect(clientId);
  };

  return (
    <div className="border rounded-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Nom complet</TableHead>
            <TableHead className="font-semibold">Contact</TableHead>
            <TableHead className="font-semibold">Date d'inscription</TableHead>
            <TableHead className="font-semibold">Statut</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map(client => (
            <TableRow 
              key={client.id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={(e) => handleViewDetails(e, client.id)}
            >
              <TableCell className="font-medium">{client.full_name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  {client.phone && (
                    <span className="text-sm flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1 text-gray-500" />
                      {client.phone}
                    </span>
                  )}
                  {client.email && (
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {client.email}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {client.created_at && (
                  <span className="text-sm">
                    {format(new Date(client.created_at), 'P', { locale: fr })}
                  </span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(client.status)}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleViewDetails(e, client.id)}
                  type="button"
                  className="hover:bg-[#0D6A51]/10 hover:text-[#0D6A51] hover:border-[#0D6A51]/30"
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Gérer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsList;
