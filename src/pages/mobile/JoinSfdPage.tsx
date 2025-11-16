import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ClientAdhesionForm } from '@/components/client/ClientAdhesionForm';
import { supabase } from '@/integrations/supabase/client';

interface Sfd {
  id: string;
  name: string;
  code: string;
  region?: string;
  description?: string;
  logo_url?: string;
}

const JoinSfdPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const sfdIdParam = searchParams.get('sfdId');

  const [sfds, setSfds] = useState<Sfd[]>([]);
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentification requise',
        description: 'Vous devez être connecté pour rejoindre une SFD',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    loadSfds();
  }, [user, navigate]);

  const loadSfds = async () => {
    try {
      setIsLoading(true);

      // Charger toutes les SFDs actives
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      setSfds(data || []);

      // Si un sfdId est passé en paramètre, sélectionner automatiquement cette SFD
      if (sfdIdParam && data) {
        const sfd = data.find(s => s.id === sfdIdParam);
        if (sfd) {
          setSelectedSfd(sfd);
        }
      }
    } catch (error: any) {
      console.error('Error loading SFDs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les SFDs disponibles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSfds = sfds.filter(sfd =>
    sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sfd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sfd.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSfdSelect = (sfd: Sfd) => {
    setSelectedSfd(sfd);
  };

  const handleSuccess = () => {
    toast({
      title: 'Demande envoyée',
      description: 'Votre demande d\'adhésion a été envoyée. Vous recevrez une notification une fois validée.',
    });

    // Rediriger vers le tableau de bord après 2 secondes
    setTimeout(() => {
      navigate('/mobile-flow/account');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des SFDs...</p>
        </div>
      </div>
    );
  }

  if (selectedSfd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container max-w-2xl mx-auto p-4 pb-20">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedSfd(null)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Rejoindre {selectedSfd.name}</h1>
              <p className="text-sm text-muted-foreground">
                Remplissez le formulaire d'adhésion
              </p>
            </div>
          </div>

          {/* SFD Info Card */}
          <Card className="mb-6 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-4">
                {selectedSfd.logo_url ? (
                  <img
                    src={selectedSfd.logo_url}
                    alt={selectedSfd.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl">{selectedSfd.name}</CardTitle>
                  <CardDescription>
                    Code: {selectedSfd.code} • {selectedSfd.region}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {selectedSfd.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{selectedSfd.description}</p>
              </CardContent>
            )}
          </Card>

          {/* Adhesion Form */}
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Formulaire d'adhésion</CardTitle>
              <CardDescription>
                Complétez vos informations pour devenir client de cette SFD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientAdhesionForm sfdId={selectedSfd.id} onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-4xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Rejoindre une SFD</h1>
            <p className="text-sm text-muted-foreground">
              Choisissez la SFD que vous souhaitez rejoindre
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Label htmlFor="search" className="sr-only">
            Rechercher une SFD
          </Label>
          <Input
            id="search"
            placeholder="Rechercher par nom, code ou région..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12"
          />
        </div>

        {/* SFD List */}
        <div className="grid gap-4">
          {filteredSfds.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {searchTerm
                    ? 'Aucune SFD ne correspond à votre recherche'
                    : 'Aucune SFD disponible'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSfds.map((sfd) => (
              <Card
                key={sfd.id}
                className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md border-border/50 bg-card/80 backdrop-blur"
                onClick={() => handleSfdSelect(sfd)}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  {sfd.logo_url ? (
                    <img
                      src={sfd.logo_url}
                      alt={sfd.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{sfd.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {sfd.code} • {sfd.region || 'Toutes régions'}
                    </p>
                    {sfd.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {sfd.description}
                      </p>
                    )}
                  </div>
                  <CheckCircle className="h-6 w-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinSfdPage;
