
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BuildingIcon, 
  MapPinIcon, 
  MailIcon, 
  PhoneIcon,
  UsersIcon,
  Banknote,
  PencilIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SFD } from '@/hooks/useSfdManagement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SfdDetailProps {
  selectedSfd: SFD;
  onEdit: (sfd: SFD) => void;
}

export function SfdDetail({ selectedSfd, onEdit }: SfdDetailProps) {
  // Récupérer les statistiques de la SFD
  const { data: stats } = useQuery({
    queryKey: ['sfd-stats', selectedSfd.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfd_stats')
        .select('*')
        .eq('sfd_id', selectedSfd.id)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  // Récupérer le nombre de prêts actifs
  const { data: activeLoans } = useQuery({
    queryKey: ['active-loans', selectedSfd.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*', { count: 'exact', head: true })
        .eq('sfd_id', selectedSfd.id)
        .eq('status', 'active');
        
      if (error) throw error;
      return data?.length || 0;
    }
  });

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-amber-100 text-amber-800'
  };

  const statusLabels = {
    active: 'Actif',
    inactive: 'Inactif',
    suspended: 'Suspendu',
    pending: 'En attente'
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mr-4">
            {selectedSfd.logo_url ? (
              <img 
                src={selectedSfd.logo_url} 
                alt={selectedSfd.name} 
                className="h-14 w-14 rounded-full object-cover" 
              />
            ) : (
              <BuildingIcon className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{selectedSfd.name}</h2>
            <p className="text-sm text-muted-foreground">Code: {selectedSfd.code}</p>
            <div className="mt-1">
              <Badge className={statusColors[selectedSfd.status as keyof typeof statusColors]}>
                {statusLabels[selectedSfd.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </div>
        </div>
        
        <Button onClick={() => onEdit(selectedSfd)} variant="outline" size="sm">
          <PencilIcon className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations de contact</h3>
          
          {selectedSfd.region && (
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span>{selectedSfd.region}</span>
            </div>
          )}
          
          {selectedSfd.contact_email && (
            <div className="flex items-center">
              <MailIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span>{selectedSfd.contact_email}</span>
            </div>
          )}
          
          {selectedSfd.phone && (
            <div className="flex items-center">
              <PhoneIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span>{selectedSfd.phone}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Statistiques</h3>
          
          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span>{stats?.total_clients || 0} clients</span>
          </div>
          
          <div className="flex items-center">
            <Banknote className="h-5 w-5 text-gray-500 mr-2" />
            <span>{activeLoans || 0} prêts actifs</span>
          </div>
          
          <div className="flex items-center">
            <div className="h-5 w-5 flex items-center justify-center mr-2">
              <span className="text-xs font-medium">%</span>
            </div>
            <span>Taux de remboursement: {stats?.repayment_rate || 0}%</span>
          </div>
        </div>
      </div>
      
      {selectedSfd.description && (
        <div>
          <h3 className="text-lg font-medium mb-2">Description</h3>
          <p className="text-gray-700">{selectedSfd.description}</p>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-2">Date de création</h3>
        <p className="text-gray-700">
          {new Date(selectedSfd.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>
    </div>
  );
}
