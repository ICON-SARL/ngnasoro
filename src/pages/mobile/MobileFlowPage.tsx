import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const MobileFlowPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut, isClient, isCheckingRole } = useAuth();

  useEffect(() => {
    const checkSfdAssociation = async () => {
      if (!loading && !isCheckingRole) {
        if (!user) {
          toast({
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder à cette page.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
        
        if (isClient) {
          const { data: userSfds } = await supabase
            .from('user_sfds')
            .select('sfd_id, is_default')
            .eq('user_id', user.id);
          
          if (!userSfds || userSfds.length === 0) {
            toast({
              title: "Aucun SFD associé",
              description: "Veuillez choisir ou rejoindre un SFD pour continuer.",
              variant: "destructive",
            });
            navigate('/sfd-selection', { replace: true });
            return;
          }
          
          const hasDefaultSfd = userSfds.some(s => s.is_default);
          if (!hasDefaultSfd && userSfds.length > 1) {
            toast({
              title: "Sélection SFD requise",
              description: "Veuillez choisir votre SFD actif.",
            });
            navigate('/sfd-selection', { replace: true });
            return;
          }
        } else {
          toast({
            title: "Accès refusé",
            description: "Cette interface est réservée aux clients.",
            variant: "destructive",
          });
          navigate('/auth', { replace: true });
          return;
        }
      }
    };
    
    checkSfdAssociation();
  }, [user, loading, isCheckingRole, navigate, toast, location.pathname, isClient]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth', { replace: true });
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Impossible de vous déconnecter.",
        variant: "destructive",
      });
    }
  };

  if (loading || isCheckingRole) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <MobileNavigation />
    </div>
  );
};

export default MobileFlowPage;
