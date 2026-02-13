import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Building2, 
  ArrowLeft, 
  CheckCircle, 
  Clock,
  Shield,
  Users,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import { Skeleton } from '@/components/ui/skeleton';

interface SfdData {
  id: string;
  name: string;
  code: string;
  region?: string;
  description?: string;
  logo_url?: string;
  status: string;
}

interface UserRequest {
  id: string;
  sfd_id: string;
  status: string;
  created_at: string;
}

const SfdSelectionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sfds, setSfds] = useState<SfdData[]>([]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSfdId, setSelectedSfdId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load SFDs and user's existing requests in parallel
      const [sfdsResult, requestsResult] = await Promise.all([
        supabase
          .from('sfds')
          .select('id, name, code, region, description, logo_url, status')
          .eq('status', 'active')
          .order('name'),
        supabase
          .from('client_adhesion_requests')
          .select('id, sfd_id, status, created_at')
          .eq('user_id', user!.id)
      ]);

      if (sfdsResult.error) throw sfdsResult.error;
      if (requestsResult.error) throw requestsResult.error;

      setSfds(sfdsResult.data || []);
      setUserRequests(requestsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRequestStatus = (sfdId: string) => {
    return userRequests.find(r => r.sfd_id === sfdId);
  };

  const handleSelectSfd = async (sfdId: string) => {
    if (!user) return;

    // Check if already has a request for this SFD
    const existingRequest = getRequestStatus(sfdId);
    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        toast({
          title: 'Demande en cours',
          description: 'Votre demande est déjà en cours de traitement',
        });
        return;
      }
      if (existingRequest.status === 'approved') {
        toast({
          title: 'Déjà membre',
          description: 'Vous êtes déjà membre de cette SFD',
        });
        navigate('/mobile-flow/dashboard');
        return;
      }
    }

    setSelectedSfdId(sfdId);
    setIsSubmitting(true);

    try {
      // Get user profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('id', user.id)
        .single();

      // Create adhesion request
      const referenceNumber = `ADH-${Date.now().toString().slice(-8)}`;
      
      const { error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: profile?.full_name || 'Non renseigné',
          phone: profile?.phone || null,
          email: profile?.email || null,
          status: 'pending',
          reference_number: referenceNumber
        });

      if (error) throw error;

      toast({
        title: '✅ Demande envoyée',
        description: 'Votre demande d\'adhésion a été envoyée avec succès',
      });

      // Update local state
      setUserRequests(prev => [...prev, {
        id: 'new',
        sfd_id: sfdId,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

      // Redirect to status page after delay
      setTimeout(() => {
        navigate('/adhesion-status');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible d\'envoyer la demande',
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

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="bg-primary text-primary-foreground p-6 pb-12">
          <Skeleton className="h-8 w-48 bg-white/20 mb-4" />
          <Skeleton className="h-4 w-64 bg-white/10" />
        </div>
        <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground p-6 pb-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-lg mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Retour</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold">Choisir votre SFD</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm">
            Sélectionnez une structure de microfinance pour commencer
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto px-4 -mt-6 relative z-20">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une SFD..."
            className="pl-12 h-12 bg-background shadow-lg border-0 rounded-xl text-base"
          />
        </div>
      </div>

      {/* Info banner */}
      <div className="max-w-lg mx-auto px-4 mt-4">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Votre demande sera examinée par la SFD. Vous recevrez une notification une fois approuvée.
          </p>
        </div>
      </div>

      {/* SFD List */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredSfds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  {searchTerm ? 'Aucune SFD trouvée' : 'Aucune SFD disponible'}
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Essayez avec un autre terme de recherche
                </p>
              </Card>
            </motion.div>
          ) : (
            filteredSfds.map((sfd, index) => {
              const request = getRequestStatus(sfd.id);
              const isPending = request?.status === 'pending';
              const isApproved = request?.status === 'approved';
              const isRejected = request?.status === 'rejected';
              const isSelected = selectedSfdId === sfd.id;

              return (
                <motion.div
                  key={sfd.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card
                    className={`p-5 transition-all duration-300 border-2 ${
                      isApproved 
                        ? 'border-green-500/30 bg-green-50/50 dark:bg-green-950/20' 
                        : isPending 
                          ? 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20'
                          : isRejected
                            ? 'border-destructive/30 bg-destructive/5'
                            : 'border-transparent hover:border-primary/30 hover:shadow-lg cursor-pointer'
                    }`}
                    onClick={() => !isSubmitting && !isPending && !isApproved && handleSelectSfd(sfd.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="shrink-0">
                        {sfd.logo_url ? (
                          <img
                            src={sfd.logo_url}
                            alt={sfd.name}
                            className="h-14 w-14 rounded-xl object-cover ring-2 ring-primary/10"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Building2 className="h-7 w-7 text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-semibold text-foreground truncate">{sfd.name}</h3>
                            <p className="text-sm text-muted-foreground">{sfd.code}</p>
                          </div>
                          
                          {/* Status badges */}
                          {isApproved && (
                            <Badge className="bg-green-500 text-white shrink-0">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Membre
                            </Badge>
                          )}
                          {isPending && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 shrink-0">
                              <Clock className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge variant="destructive" className="shrink-0">
                              Refusée
                            </Badge>
                          )}
                        </div>

                        {sfd.region && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{sfd.region}</span>
                          </div>
                        )}

                        {sfd.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {sfd.description}
                          </p>
                        )}

                        {/* Action button */}
                        {!isPending && !isApproved && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSfd(sfd.id);
                            }}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                          >
                            {isSelected && isSubmitting ? (
                              <>
                                <Loader size="sm" className="mr-2" />
                                Envoi en cours...
                              </>
                            ) : isRejected ? (
                              <>
                                <Sparkles className="h-4 w-4 mr-1" />
                                Réessayer
                              </>
                            ) : (
                              <>
                                <Users className="h-4 w-4 mr-1" />
                                Rejoindre
                              </>
                            )}
                          </Button>
                        )}

                        {isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/mobile-flow/dashboard');
                            }}
                            className="w-full sm:w-auto"
                          >
                            Accéder au dashboard
                          </Button>
                        )}

                        {isPending && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-2">
                            <Clock className="h-3 w-3" />
                            Demande envoyée, en attente de validation
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Pending requests CTA */}
        {userRequests.some(r => r.status === 'pending') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4"
          >
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Demandes en cours</p>
                    <p className="text-xs text-muted-foreground">
                      Suivez l'état de vos demandes
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/adhesion-status')}
                >
                  Voir le suivi
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SfdSelectionPage;
