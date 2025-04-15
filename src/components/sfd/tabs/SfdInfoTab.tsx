
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtendedSfd } from '@/types/sfd-types';

interface SfdInfoTabProps {
  sfd: ExtendedSfd;
}

export function SfdInfoTab({ sfd }: SfdInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de la SFD</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">Nom</p>
          <p className="text-muted-foreground">{sfd.name}</p>
        </div>
        <div>
          <p className="font-medium">Code</p>
          <p className="text-muted-foreground">{sfd.code}</p>
        </div>
        {sfd.region && (
          <div>
            <p className="font-medium">Région</p>
            <p className="text-muted-foreground">{sfd.region}</p>
          </div>
        )}
        {sfd.contact_email && (
          <div>
            <p className="font-medium">Email</p>
            <p className="text-muted-foreground">{sfd.contact_email}</p>
          </div>
        )}
        {sfd.phone && (
          <div>
            <p className="font-medium">Téléphone</p>
            <p className="text-muted-foreground">{sfd.phone}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
