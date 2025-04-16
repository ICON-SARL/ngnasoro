
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { JoinSfdButton } from './JoinSfdButton';
import { Sfd } from '@/types/sfd-types';

interface AvailableSfdCardProps {
  sfd: Sfd;
}

export const AvailableSfdCard: React.FC<AvailableSfdCardProps> = ({ sfd }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {sfd.logo_url ? (
              <img 
                src={sfd.logo_url} 
                alt={sfd.name} 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <Building className="h-6 w-6 text-primary" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{sfd.name}</h3>
            <p className="text-sm text-muted-foreground">
              {sfd.region || 'Région non spécifiée'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <JoinSfdButton sfdId={sfd.id} sfdName={sfd.name} />
        </div>
      </CardContent>
    </Card>
  );
};
