import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAdhesion } from '@/hooks/sfd/useSfdAdhesion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';

const SfdSelectionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sfds, setSfds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSfds();
  }, []);

  const loadSfds = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      setSfds(data || []);
    } catch (error) {
      console.error('Error loading SFDs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les SFDs disponibles',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSfd = async (sfdId: string) => {
    if (!user) return;

    setSelectedSfdId(sfdId);
    setIsSubmitting(true);

    try {
      // Appeler l'Edge Function pour initialiser le compte client
      const { data, error } = await supabase.functions.invoke('initialize-client-account', {
        body: {
          userId: user.id,
          sfdId,
          makeDefault: true
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: '✅ Succès',
          description: `Vous êtes maintenant membre de ${data.data.sfd.name}`,
        });

        // Attendre un peu puis rediriger vers le dashboard
        setTimeout(() => {
          navigate('/mobile-flow/dashboard');
        }, 2000);
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Error selecting SFD:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de rejoindre cette SFD',
        variant: 'destructive'
      });
      setSelectedSfdId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSfds = sfds.filter(sfd =>
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sfd.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sfd.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0D6A51]/5 to-white">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D6A51]/5 to-white">
      {/* Header */}
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-2xl font-bold">Choisir votre SFD</h1>
          <p className="text-white/80 mt-1">
            Sélectionnez une structure de microfinance pour commencer
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto px-4 -mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une SFD..."
            className="pl-10 bg-white shadow-md border-0"
          />
        </div>
      </div>

      {/* SFD List */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {filteredSfds.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucune SFD trouvée' : 'Aucune SFD disponible'}
            </p>
          </Card>
        ) : (
          filteredSfds.map((sfd) => (
            <Card
              key={sfd.id}
              className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#0D6A51]/30"
              onClick={() => !isSubmitting && handleSelectSfd(sfd.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {sfd.logo_url ? (
                      <img
                        src={sfd.logo_url}
                        alt={sfd.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-[#0D6A51]" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{sfd.name}</h3>
                      <p className="text-sm text-gray-500">{sfd.code}</p>
                    </div>
                  </div>

                  {sfd.region && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{sfd.region}</span>
                    </div>
                  )}

                  {sfd.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{sfd.description}</p>
                  )}

                  <Badge variant="secondary" className="mt-2">
                    Active
                  </Badge>
                </div>

                {selectedSfdId === sfd.id && isSubmitting ? (
                  <div className="ml-4">
                    <Loader size="sm" />
                  </div>
                ) : selectedSfdId === sfd.id ? (
                  <CheckCircle className="ml-4 h-6 w-6 text-green-500" />
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSfd(sfd.id);
                    }}
                    disabled={isSubmitting}
                  >
                    Rejoindre
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SfdSelectionPage;
