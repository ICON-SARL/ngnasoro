
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { JoinSfdButton } from './JoinSfdButton';

interface AvailableSfdCardProps {
  sfd: {
    id: string;
    name: string;
    code: string;
    region?: string;
    logo_url?: string;
  };
}

export const AvailableSfdCard: React.FC<AvailableSfdCardProps> = ({ sfd }) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-4">
          {sfd.logo_url ? (
            <img 
              src={sfd.logo_url} 
              alt={sfd.name} 
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <h3 className="font-medium">{sfd.name}</h3>
            <p className="text-sm text-muted-foreground">
              {sfd.region || sfd.code}
            </p>
          </div>
        </div>
        
        <JoinSfdButton sfdId={sfd.id} sfdName={sfd.name} />
      </CardContent>
    </Card>
  );
};
