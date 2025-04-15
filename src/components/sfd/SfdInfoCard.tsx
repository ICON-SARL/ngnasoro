
import React from 'react';
import { Building, MapPin, Mail, User, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SfdInfoCardProps {
  sfd: {
    name: string;
    code: string;
    region?: string;
    contact_email?: string;
    phone?: string;
    status: string;
    client_count?: number;
  };
  onManage?: () => void;
}

export function SfdInfoCard({ sfd, onManage }: SfdInfoCardProps) {
  return (
    <Card className="overflow-hidden border-gray-200">
      <div className="h-2 w-full bg-green-500" />
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-lg">{sfd.name}</h3>
              <p className="text-sm text-muted-foreground">Code: {sfd.code}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onManage}>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-3 mb-4">
          {sfd.region && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 text-gray-500 mr-2" />
              <span>{sfd.region}</span>
            </div>
          )}
          {sfd.contact_email && (
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 text-gray-500 mr-2" />
              <span>{sfd.contact_email}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 text-gray-500 mr-2" />
            <span>{sfd.client_count || 0} clients</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Badge variant={sfd.status === 'active' ? 'default' : 'destructive'}>
            {sfd.status === 'active' ? 'Actif' : 'Inactif'}
          </Badge>
          <Button variant="outline" size="sm" onClick={onManage}>
            Gérer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
