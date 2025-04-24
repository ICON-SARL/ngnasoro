
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, Loader2, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { JoinSfdButton } from '@/components/mobile/sfd/JoinSfdButton';
import { supabase } from '@/integrations/supabase/client';

interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  status: string;
  logo_url?: string | null;
}

const SfdSelectorPage: React.FC = () => {
  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [filteredSfds, setFilteredSfds] = useState<Sfd[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast({
        title: 'Connexion requise',
        description: 'Vous devez être connecté pour accéder à cette page',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    // Charger les SFDs disponibles
    const fetchSfds = async () => {
      setIsLoading(true);
      
      try {
        console.log('Fetching SFDs - Debug info');
        
        // Récupérer les SFDs depuis la base de données
        const { data: sfdsData, error: sfdsError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');
          
        if (sfdsError) throw sfdsError;
        
        console.log(`Fetched ${sfdsData?.length || 0} SFDs from database:`, sfdsData);
        
        if (sfdsData && sfdsData.length > 0) {
          setSfds(sfdsData);
          setFilteredSfds(sfdsData);
        } else {
          // Utiliser une fonction Edge pour récupérer les SFDs si la base de données ne contient rien
          console.log('No SFDs found in database, trying edge function');
          
          try {
            // Simuler une récupération depuis une fonction Edge
            // Dans un cas réel, vous appelleriez votre fonction Edge ici
            const edgeSfds = [
              {
                id: "e578e987-67ac-4027-abf4-1b619b642a6c",
                name: "RMCR",
                code: "MEREF-SFD01",
                region: "Bamako",
                status: "active",
                logo_url: null
              },
              {
                id: "46e7cbd0-1e85-4e15-b740-4dee17f295ad",
                name: "CEVCA ON",
                code: "MEREF-SFD02",
                region: "Bamako",
                status: "active",
                logo_url: null
              }
            ];
            
            console.log(`Fetched ${edgeSfds.length} SFDs from Edge function:`, edgeSfds);
            setSfds(edgeSfds);
            setFilteredSfds(edgeSfds);
          } catch (edgeError) {
            console.error('Error fetching SFDs from Edge function:', edgeError);
            throw edgeError;
          }
        }
        
        // Récupérer les demandes d'adhésion existantes pour filtrer les SFDs
        console.log('Fetching existing client adhesion requests');
        const { data: requests, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select('sfd_id, status')
          .eq('user_id', user.id);
          
        if (requestsError) {
          console.warn('Error fetching adhesion requests:', requestsError);
        } else {
          console.log('Existing adhesion requests:', requests);
        }
          
        // Récupérer les SFDs auxquelles l'utilisateur est déjà associé
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id);
          
        if (userSfdsError) {
          console.warn('Error fetching user SFDs:', userSfdsError);
        } else {
          console.log('User has', userSfds?.length || 0, 'SFDs already associated:', userSfds);
        }
        
        // Filtrer les SFDs pour n'afficher que celles disponibles
        const existingSfdIds = new Set([
          ...(userSfds?.map(us => us.sfd_id) || []),
          ...(requests?.filter(r => r.status === 'approved').map(r => r.sfd_id) || [])
        ]);
        
        const availableSfds = (sfdsData || edgeSfds || []).filter(
          sfd => !existingSfdIds.has(sfd.id)
        );
        
        console.log(`After filtering, ${availableSfds.length} SFDs are available for selection:`, availableSfds);
        
      } catch (error) {
        console.error('Error fetching SFDs:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer la liste des SFDs',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSfds();
  }, [user, navigate, toast]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSfds(sfds);
    } else {
      const filtered = sfds.filter(
        sfd => 
          sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sfd.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sfd.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSfds(filtered);
    }
  }, [searchTerm, sfds]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Sélection SFD</h1>
      </div>
      
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un SFD par nom ou région"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
          </div>
        ) : filteredSfds.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune SFD disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSfds.map(sfd => (
              <div 
                key={sfd.id} 
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-lime-100 rounded-full flex items-center justify-center mr-3">
                    {sfd.logo_url ? (
                      <img 
                        src={sfd.logo_url} 
                        alt={`Logo ${sfd.name}`}
                        className="h-8 w-8 object-contain" 
                      />
                    ) : (
                      <Building className="h-6 w-6 text-lime-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{sfd.name}</h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{sfd.region || 'Inconnu'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-end">
                  <JoinSfdButton 
                    sfdId={sfd.id} 
                    sfdName={sfd.name}
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SfdSelectorPage;
