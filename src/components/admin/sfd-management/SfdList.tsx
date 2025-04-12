
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface SfdListProps {
  sfds: any[];
  filteredSfds: any[];
  isLoading: boolean;
  isRetrying: boolean;
  searchQuery: string;
  selectedSfd: any;
  retryCount: number;
  maxRetries: number;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSfd: (sfd: any) => void;
}

export function SfdList({
  sfds,
  filteredSfds,
  isLoading,
  isRetrying,
  searchQuery,
  selectedSfd,
  retryCount,
  maxRetries,
  onSearchChange,
  onSelectSfd
}: SfdListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  // Function to sort SFDs with priority names first
  const prioritizeSfds = (sfds: any[]) => {
    const prioritySfdNames = ["premier sfd", "deuxieme", "troisieme"];
    
    return [...sfds].sort((a, b) => {
      const aIsPriority = prioritySfdNames.includes(a.name.toLowerCase());
      const bIsPriority = prioritySfdNames.includes(b.name.toLowerCase());
      
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      
      if (aIsPriority && bIsPriority) {
        return prioritySfdNames.indexOf(a.name.toLowerCase()) - prioritySfdNames.indexOf(b.name.toLowerCase());
      }
      
      return a.name.localeCompare(b.name);
    });
  };
  
  // Apply prioritization to the filtered SFDs
  const sortedFilteredSfds = prioritizeSfds(filteredSfds);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>SFDs Partenaires</CardTitle>
        <CardDescription>
          {sfds.length} institutions enregistrées
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom ou région..."
            className="pl-9"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
      </CardHeader>
      <CardContent className="h-[500px] overflow-auto">
        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="flex items-center h-14 w-full rounded-md" />
            ))}
          </div>
        ) : isRetrying ? (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Tentative {retryCount}/{maxRetries}...</p>
          </div>
        ) : sortedFilteredSfds.length > 0 ? (
          <div className="space-y-2">
            {sortedFilteredSfds.map((sfd) => (
              <div 
                key={sfd.id}
                className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-muted ${selectedSfd?.id === sfd.id ? 'bg-muted' : ''}`}
                onClick={() => onSelectSfd(sfd)}
              >
                <div className="flex-shrink-0 h-10 w-10 mr-3 bg-primary/10 rounded-full flex items-center justify-center">
                  {sfd.logo_url ? (
                    <img src={sfd.logo_url} alt={sfd.name} className="h-8 w-8 rounded-full" />
                  ) : (
                    <Building className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{sfd.name}</p>
                    <div className="ml-2">{getStatusBadge(sfd.status)}</div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Code: {sfd.code} {sfd.region ? `• ${sfd.region}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            Aucune SFD trouvée
          </div>
        )}
      </CardContent>
    </Card>
  );
}
