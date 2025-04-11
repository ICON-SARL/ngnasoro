
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Sfd {
  id: string;
  name: string;
  region?: string;
  code?: string;
  logo_url?: string | null;
}

const SfdList: React.FC = () => {
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSfds = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('sfds')
          .select('id, name, region, code, logo_url')
          .order('name');

        if (error) throw error;
        setSfds(data || []);
      } catch (err: any) {
        console.error('Erreur lors du chargement des SFDs:', err);
        setError('Impossible de charger la liste des SFDs. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSfds();
  }, []);

  const handleSelectSfd = (sfdId: string) => {
    // Naviguer vers la page d'informations SFD ou d'inscription avec l'URL correcte
    navigate('/mobile-flow/sfd-selector', { state: { selectedSfdId: sfdId } });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {sfds.map((sfd) => (
        <div
          key={sfd.id}
          onClick={() => handleSelectSfd(sfd.id)}
          className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="h-12 w-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center mr-4 overflow-hidden">
            {sfd.logo_url ? (
              <img
                src={sfd.logo_url}
                alt={sfd.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-gray-400">
                {sfd.code || sfd.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{sfd.name}</h3>
            {sfd.region && (
              <p className="text-sm text-gray-500">{sfd.region}</p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      ))}
    </div>
  );
};

export default SfdList;
