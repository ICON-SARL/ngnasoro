
import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import MobileNavigation from '@/components/MobileNavigation';
import { supabase } from '@/integrations/supabase/client';

const MobileFlowPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, loading, signOut, isClient, isCheckingRole } = useAuth();

  // Check if user is authenticated and has client role
  useEffect(() => {
    console.log('MobileFlowPage: Auth state check', {
      loading,
      isCheckingRole,
      user: !!user,
      isClient,
      pathname: location.pathname
    });

    const checkSfdAssociation = async () => {
      if (!loading && !isCheckingRole) {
        if (!user) {
          console.log('MobileFlowPage: No user, redirecting to auth');
          toast({
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder à cette page.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
        
        // Allow clients to access mobile flow
        if (isClient) {
          console.log('MobileFlowPage: Client user detected, checking SFD association');
          
          // Vérifier si l'utilisateur a un SFD associé
          const { data: userSfds } = await supabase
            .from('user_sfds')
            .select('sfd_id, is_default')
            .eq('user_id', user.id);
          
          if (!userSfds || userSfds.length === 0) {
            console.log('MobileFlowPage: No SFD associated, redirecting to SFD selection');
            toast({
              title: "Aucun SFD associé",
              description: "Veuillez choisir ou rejoindre un SFD pour continuer.",
              variant: "destructive",
            });
            navigate('/sfd-selection', { replace: true });
            return;
          }
          
          // Vérifier si un SFD par défaut est défini
          const hasDefaultSfd = userSfds.some(s => s.is_default);
          if (!hasDefaultSfd && userSfds.length > 1) {
            console.log('MobileFlowPage: Multiple SFDs but no default, redirecting to selection');
            toast({
              title: "Sélection SFD requise",
              description: "Veuillez choisir votre SFD actif.",
            });
            navigate('/sfd-selection', { replace: true });
            return;
          }
          
          console.log('MobileFlowPage: SFD association validated');
        } else {
          console.log('MobileFlowPage: User does not have client role, redirecting to auth');
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

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('MobileFlowPage: Starting logout');
      await signOut();
      navigate('/auth', { replace: true });
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error) {
      console.error('MobileFlowPage: Logout error:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Impossible de vous déconnecter.",
        variant: "destructive",
      });
    }
  };

  if (loading || isCheckingRole) {
    console.log('MobileFlowPage: Still loading...');
    return <div className="p-8 text-center">Chargement...</div>;
  }

  console.log('MobileFlowPage: Rendering mobile interface');
  return (
    <div className="min-h-screen bg-white pb-16">
      <Outlet />
      <MobileNavigation />
    </div>
  );
};

export default MobileFlowPage;
