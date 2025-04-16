
import React from 'react';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';

interface SfdListItemProps {
  sfd: {
    id: string;
    name: string;
    code: string;
    region?: string;
    logo_url?: string;
  };
  isPending: boolean;
  onClick: () => void;
}

export const SfdListItem: React.FC<SfdListItemProps> = ({
  sfd,
  isPending,
  onClick,
}) => {
  return (
    <CardContent className="p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
          {sfd.logo_url ? (
            <img 
              src={sfd.logo_url} 
              alt={sfd.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <Building className="h-6 w-6 text-primary" />
          )}
        </div>
        <div>
          <h3 className="font-medium">{sfd.name}</h3>
          <p className="text-sm text-muted-foreground">
            {sfd.region || sfd.code}
          </p>
        </div>
      </div>
      <Button 
        variant="secondary" 
        className="ml-4"
        disabled={isPending}
        onClick={onClick}
      >
        {isPending ? 'Demande en cours' : 'Rejoindre'}
      </Button>
    </CardContent>
  );
};
