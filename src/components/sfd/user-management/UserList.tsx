
import React from 'react';
import { SfdClient } from '@/types/sfdClients';
import { User, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserListProps {
  users: SfdClient[];
  isLoading: boolean;
  onEdit: (user: SfdClient) => void;
  onDelete: (user: SfdClient) => void;
}

export function UserList({ users, isLoading, onEdit, onDelete }: UserListProps) {
  // Render KYC level as a progress bar
  const renderKycLevel = (level: number) => {
    const percentage = (level / 3) * 100;
    return (
      <div className="flex items-center space-x-2">
        <Progress value={percentage} className="h-2 w-32" />
        <span className="text-xs text-muted-foreground">{level}/3</span>
      </div>
    );
  };
  
  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Actif</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Inactif</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nom Complet</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Adresse</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Niveau KYC</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Chargement des clients...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center">
                  <User className="h-12 w-12 text-gray-300 mb-2" />
                  <p>Aucun client trouvé</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {user.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3.5 w-3.5 mr-1.5" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate max-w-[200px]">
                          {user.address || 'Non renseigné'}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {user.address || 'Adresse non renseignée'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{renderStatusBadge(user.status)}</TableCell>
                <TableCell>{renderKycLevel(user.kyc_level)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(user)}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    {user.status !== 'rejected' && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Désactiver</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
