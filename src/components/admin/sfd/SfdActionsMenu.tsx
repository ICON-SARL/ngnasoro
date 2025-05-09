
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal, Pencil, XCircle, Check, Power, Key } from 'lucide-react';
import { Sfd } from '../types/sfd-types';

interface SfdActionsMenuProps {
  sfd: Sfd;
  onSuspend: (sfd: Sfd) => void;
  onReactivate: (sfd: Sfd) => void;
  onActivate: (sfd: Sfd) => void;
  onEdit: (sfd: Sfd) => void;
  onViewDetails?: (sfd: Sfd) => void;
  onResetPassword?: (sfd: Sfd) => void;
}

export function SfdActionsMenu({ 
  sfd, 
  onSuspend, 
  onReactivate, 
  onActivate,
  onEdit,
  onViewDetails,
  onResetPassword
}: SfdActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {onViewDetails && (
          <DropdownMenuItem onClick={() => onViewDetails(sfd)}>
            <Eye className="mr-2 h-4 w-4" />
            <span>Voir les détails</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => onEdit(sfd)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Modifier</span>
        </DropdownMenuItem>
        
        {onResetPassword && (
          <DropdownMenuItem onClick={() => onResetPassword(sfd)}>
            <Key className="mr-2 h-4 w-4" />
            <span>Réinitialiser mot de passe</span>
          </DropdownMenuItem>
        )}
        
        {(!sfd.status || sfd.status === 'active') ? (
          <DropdownMenuItem 
            onClick={() => onSuspend(sfd)}
            className="text-red-600 hover:text-red-700"
          >
            <XCircle className="mr-2 h-4 w-4" />
            <span>Désactiver</span>
          </DropdownMenuItem>
        ) : sfd.status === 'suspended' ? (
          <DropdownMenuItem 
            onClick={() => onReactivate(sfd)}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            <span>Réactiver</span>
          </DropdownMenuItem>
        ) : sfd.status === 'pending' ? (
          <DropdownMenuItem 
            onClick={() => onActivate(sfd)}
            className="text-green-600 hover:text-green-700"
          >
            <Power className="mr-2 h-4 w-4" />
            <span>Activer</span>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
