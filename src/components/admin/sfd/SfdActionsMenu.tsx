
import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Ban, Power, CheckCircle } from 'lucide-react';

interface Sfd {
  id: string;
  name: string;
  status: string;
  [key: string]: any;
}

interface SfdActionsMenuProps {
  sfd: Sfd;
  onSuspend: (sfd: Sfd) => void;
  onReactivate: (sfd: Sfd) => void;
  onActivate: (sfd: Sfd) => void;
  onEdit: (sfd: Sfd) => void;
}

export function SfdActionsMenu({ 
  sfd, 
  onSuspend, 
  onReactivate,
  onActivate,
  onEdit 
}: SfdActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(sfd)}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </DropdownMenuItem>
        
        {sfd.status === 'active' && (
          <DropdownMenuItem onClick={() => onSuspend(sfd)}>
            <Ban className="h-4 w-4 mr-2" />
            Suspendre
          </DropdownMenuItem>
        )}
        
        {sfd.status === 'suspended' && (
          <DropdownMenuItem onClick={() => onReactivate(sfd)}>
            <Power className="h-4 w-4 mr-2" />
            Réactiver
          </DropdownMenuItem>
        )}
        
        {sfd.status === 'pending' && (
          <DropdownMenuItem onClick={() => onActivate(sfd)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Activer
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
