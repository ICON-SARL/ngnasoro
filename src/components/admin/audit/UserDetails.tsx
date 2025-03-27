
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

interface UserDetailsProps {
  userId: string;
}

export function UserDetails({ userId }: UserDetailsProps) {
  const { user } = useAuth();
  
  // If it's the current user
  if (user && user.id === userId) {
    return (
      <div className="flex items-center gap-1">
        <span>{user.full_name || user.email}</span>
        <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-600">Vous</Badge>
      </div>
    );
  }
  
  // For other users, we could fetch their details from a users table
  // For now, just show the ID with a tooltip explaining it's a user ID
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex items-center">
          <span className="truncate">{userId}</span>
          <InfoIcon className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm">ID utilisateur</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
