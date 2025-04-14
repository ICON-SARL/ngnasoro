
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building, User, MapPin, Mail, Phone, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock SFD data for presentation
const mockSfds = [
  {
    id: "1",
    name: "RCPB Ouagadougou",
    code: "RCPB-001",
    region: "Centre",
    status: "active",
    clientCount: 1245,
    email: "contact@rcpb.org",
    phone: "+226 76 12 34 56",
  },
  {
    id: "2",
    name: "Microcred Abidjan",
    code: "MCRD-002",
    region: "Lagunes",
    status: "active",
    clientCount: 3421,
    email: "info@microcred-abidjan.ci",
    phone: "+225 27 20 30 40 50",
  },
  {
    id: "3",
    name: "ACEP Dakar",
    code: "ACEP-003",
    region: "Dakar",
    status: "active",
    clientCount: 2890,
    email: "contact@acep.sn",
    phone: "+221 33 889 7654",
  },
  {
    id: "4",
    name: "PAMECAS Thiès",
    code: "PAMC-004",
    region: "Thiès",
    status: "inactive",
    clientCount: 1560,
    email: "info@pamecas.sn",
    phone: "+221 33 951 2345",
  }
];

export function SfdManagementManager() {
  const [sfds] = useState(mockSfds);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter SFDs based on search term
  const filteredSfds = sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sfd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sfd.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom, code, région..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button className="flex-1 sm:flex-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau SFD
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Institutions de Microfinance Partenaires</CardTitle>
          <CardDescription>
            Gérez les SFDs qui utilisent la plateforme MEREF
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSfds.length === 0 ? (
            <div className="text-center p-8 bg-muted/20 rounded-md">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Aucun SFD trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSfds.map((sfd) => (
                <Card key={sfd.id} className="overflow-hidden border-gray-200">
                  <div className={`h-2 w-full ${sfd.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
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
                      <button className="text-gray-500 hover:text-gray-700">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{sfd.region}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{sfd.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{sfd.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{sfd.clientCount} clients</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant={sfd.status === 'active' ? 'default' : 'destructive'}>
                        {sfd.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Gérer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
