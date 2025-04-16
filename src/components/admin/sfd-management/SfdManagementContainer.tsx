
import React from 'react';
import { useSfdManagement } from '@/hooks/useSfdManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Search, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SfdManagementContainer() {
  const {
    filteredSfds,
    isLoading,
    searchTerm,
    setSearchTerm,
    handleActivateSfd,
    activateSfdMutation
  } = useSfdManagement();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une SFD..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSfds.map((sfd) => (
          <Card key={sfd.id} className="overflow-hidden border-gray-200">
            <div className={`h-2 w-full ${sfd.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{sfd.name}</h3>
                  <p className="text-sm text-gray-500">Code: {sfd.code}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {sfd.region && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{sfd.region}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>0 clients</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <Badge 
                  variant={sfd.status === 'active' ? 'default' : 'outline'}
                  className={sfd.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                >
                  {sfd.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
                
                {sfd.status !== 'active' && (
                  <Button
                    onClick={() => handleActivateSfd(sfd.id)}
                    disabled={activateSfdMutation.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {activateSfdMutation.isPending ? 'Activation...' : 'Activer'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
