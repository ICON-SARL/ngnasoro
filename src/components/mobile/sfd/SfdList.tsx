
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Sfd {
  id: string;
  name: string;
  region?: string;
  code?: string;
  logo_url?: string;
}

interface SfdListProps {
  onSelectSfd: (sfdId: string) => void;
  existingRequests?: {sfd_id: string, status: string}[];
  isSubmitting?: boolean;
}

const SfdList: React.FC<SfdListProps> = ({ onSelectSfd, existingRequests = [], isSubmitting = false }) => {
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingSfdId, setSubmittingSfdId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSfds = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching all active SFDs for SfdList');
        
        const { data, error } = await supabase
          .from('sfds')
          .select('id, name, region, code, logo_url')
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        
        console.log(`Retrieved ${data?.length || 0} active SFDs`);
        
        // If no SFDs found in production, add fake data in development mode
        const sfdsList = data || [];
        if (sfdsList.length === 0 && process.env.NODE_ENV === 'development') {
          console.log('Adding sample SFDs for development');
          sfdsList.push(
            {
              id: 'sample-sfd-1',
              name: 'Exemple SFD #1',
              region: 'Région Test',
              code: 'ESFD1',
              logo_url: null
            },
            {
              id: 'sample-sfd-2',
              name: 'Exemple SFD #2',
              region: 'Région Test',
              code: 'ESFD2',
              logo_url: null
            }
          );
        }
        
        const sortedSfds = sortSfdsWithPriority(sfdsList);
        setSfds(sortedSfds);
      } catch (err: any) {
        console.error('Error fetching SFDs:', err);
        setError('Une erreur est survenue lors du chargement des SFDs.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSfds();
  }, []);

  const sortSfdsWithPriority = (sfds: Sfd[]): Sfd[] => {
    // Prioritize RMCR if present, then other priority SFDs
    const prioritySfdNames = ["rmcr", "premier sfd", "deuxieme", "troisieme"];
    
    return [...sfds].sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      const aIsPriority = prioritySfdNames.some(name => aName.includes(name));
      const bIsPriority = prioritySfdNames.some(name => bName.includes(name));
      
      // RMCR is always first
      if (aName.includes('rmcr') && !bName.includes('rmcr')) return -1;
      if (!aName.includes('rmcr') && bName.includes('rmcr')) return 1;
      
      // Then prioritize other SFDs
      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      
      return a.name.localeCompare(b.name);
    });
  };

  const getSfdRequestStatus = (sfdId: string) => {
    return existingRequests.find(req => req.sfd_id === sfdId)?.status || null;
  };
  
  const handleSfdSelect = (sfdId: string) => {
    setSubmittingSfdId(sfdId);
    onSelectSfd(sfdId);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-4"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (sfds.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Aucun SFD disponible pour le moment.</p>
        <p className="text-sm text-gray-400 mt-2">
          Si vous êtes administrateur, assurez-vous que des SFDs sont activées dans le système.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sfds.map(sfd => {
        const status = getSfdRequestStatus(sfd.id);
        const isRequested = !!status;
        const isSubmittingThis = isSubmitting && submittingSfdId === sfd.id;
        
        return (
          <div 
            key={sfd.id}
            className={`bg-white rounded-lg border ${isRequested ? 'border-gray-300 bg-gray-50' : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'} transition-all p-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center mr-3 overflow-hidden">
                  {sfd.logo_url ? (
                    <img 
                      src={sfd.logo_url} 
                      alt={sfd.name} 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">
                      {sfd.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{sfd.name}</h3>
                  <p className="text-sm text-gray-500">
                    {sfd.region || sfd.code || "Emplacement non spécifié"}
                  </p>
                </div>
              </div>
              
              {status ? (
                <Badge 
                  className={`${
                    status === 'validated' ? 'bg-green-100 text-green-800' : 
                    'bg-amber-100 text-amber-800'
                  }`}
                >
                  {status === 'validated' ? 'Approuvé' : 'En attente'}
                </Badge>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => handleSfdSelect(sfd.id)}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  disabled={isSubmitting}
                >
                  {isSubmittingThis ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Demande
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SfdList;
