import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SfdPending {
  id: string;
  name: string;
  code: string;
  region: string;
  contact_email: string;
  phone: string;
  status: string;
  submitted_at: string;
  description: string;
  address: string;
}

interface SfdApprovalQueueProps {
  pendingSfds: SfdPending[];
  isLoading: boolean;
  onSelectSfd: (sfd: SfdPending) => void;
}

export function SfdApprovalQueue({ pendingSfds, isLoading, onSelectSfd }: SfdApprovalQueueProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'Approbation en Attente</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (pendingSfds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'Approbation en Attente</CardTitle>
          <CardDescription>Aucune demande en attente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Toutes les demandes de SFD ont été traitées</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes d'Approbation en Attente</CardTitle>
        <CardDescription>{pendingSfds.length} demande(s) à traiter</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingSfds.map((sfd) => (
            <Card key={sfd.id} className="border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{sfd.name}</h3>
                      <p className="text-sm text-muted-foreground">Code: {sfd.code}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    En attente
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{sfd.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{sfd.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{sfd.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Soumis {formatDistanceToNow(new Date(sfd.submitted_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                </div>

                {sfd.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {sfd.description}
                  </p>
                )}

                <Button 
                  onClick={() => onSelectSfd(sfd)} 
                  className="w-full"
                  variant="outline"
                >
                  Examiner la demande
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
