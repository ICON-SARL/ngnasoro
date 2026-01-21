import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  RefreshCw,
  FileText,
  Calendar,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdhesionRequest {
  id: string;
  sfd_id: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  reference_number?: string;
  sfds?: {
    name: string;
    code: string;
    logo_url?: string;
    region?: string;
  };
}

const AdhesionStatusPage = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<AdhesionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  // Redirect to dashboard if user is now a client
  useEffect(() => {
    if (userRole === 'client') {
      const hasApproved = requests.some(r => r.status === 'approved');
      if (hasApproved) {
        toast({
          title: '🎉 Félicitations !',
          description: 'Votre adhésion a été approuvée. Accédez à votre espace client.',
        });
        setTimeout(() => navigate('/mobile-flow/dashboard'), 2000);
      }
    }
  }, [userRole, requests, navigate, toast]);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select(`
          id,
          sfd_id,
          status,
          created_at,
          reviewed_at,
          rejection_reason,
          reference_number,
          sfds:sfd_id (
            name,
            code,
            logo_url,
            region
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos demandes',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRequests();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Approuvée',
          className: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
          cardBorder: 'border-green-500/30',
          iconColor: 'text-green-500'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Refusée',
          className: 'bg-destructive/10 text-destructive',
          cardBorder: 'border-destructive/30',
          iconColor: 'text-destructive'
        };
      default:
        return {
          icon: Clock,
          label: 'En attente',
          className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
          cardBorder: 'border-amber-500/30',
          iconColor: 'text-amber-500'
        };
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="bg-primary text-primary-foreground p-6 pb-10">
          <Skeleton className="h-8 w-48 bg-white/20 mb-4" />
          <Skeleton className="h-4 w-64 bg-white/10" />
        </div>
        <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground p-6 pb-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-lg mx-auto relative z-10">
          <button
            onClick={() => navigate('/sfd-selection')}
            className="flex items-center gap-2 mb-4 text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Retour</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <FileText className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">Mes demandes</h1>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Suivez l'état de vos demandes d'adhésion
              </p>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-8 text-center">
                <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Aucune demande</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Vous n'avez pas encore soumis de demande d'adhésion à une SFD
                </p>
                <Button onClick={() => navigate('/sfd-selection')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Choisir une SFD
                </Button>
              </Card>
            </motion.div>
          ) : (
            requests.map((request, index) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;
              const sfd = request.sfds;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className={`p-5 border-2 ${statusConfig.cardBorder}`}>
                    {/* SFD Info */}
                    <div className="flex items-start gap-4 mb-4">
                      {sfd?.logo_url ? (
                        <img
                          src={sfd.logo_url}
                          alt={sfd.name}
                          className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary/10"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {sfd?.name || 'SFD'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {sfd?.code}
                            </p>
                          </div>
                          <Badge className={statusConfig.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Request details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Demande du {format(new Date(request.created_at), 'd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                      
                      {request.reference_number && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Réf: {request.reference_number}</span>
                        </div>
                      )}

                      {request.status === 'rejected' && request.rejection_reason && (
                        <div className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <p className="text-sm text-destructive font-medium mb-1">
                            Motif du refus :
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {request.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      {request.status === 'approved' && (
                        <Button 
                          className="w-full"
                          onClick={() => navigate('/mobile-flow/dashboard')}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Accéder à mon espace
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      )}
                      
                      {request.status === 'rejected' && (
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/sfd-selection')}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Essayer une autre SFD
                        </Button>
                      )}
                      
                      {request.status === 'pending' && (
                        <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                          <Clock className="h-4 w-4 animate-pulse" />
                          <span className="text-sm font-medium">
                            En cours de traitement par la SFD...
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Add another SFD button */}
        {requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/sfd-selection')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Demander une adhésion à une autre SFD
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdhesionStatusPage;
