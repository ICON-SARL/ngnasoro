
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Sfd {
  id: string;
  name: string;
  region?: string;
  code?: string;
  logo_url?: string;
}

interface SfdListProps {
  onSelectSfd: (sfdId: string) => void;
}

const SfdList: React.FC<SfdListProps> = ({ onSelectSfd }) => {
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSfds = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('sfds')
          .select('id, name, region, code, logo_url')
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setSfds(data || []);
      } catch (err: any) {
        console.error('Error fetching SFDs:', err);
        setError('Une erreur est survenue lors du chargement des SFDs.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSfds();
  }, []);

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
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sfds.map(sfd => (
        <div 
          key={sfd.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary/50 hover:shadow-sm transition-all"
          onClick={() => onSelectSfd(sfd.id)}
        >
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
        </div>
      ))}
    </div>
  );
};

export default SfdList;
