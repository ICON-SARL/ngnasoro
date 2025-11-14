import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, UserPlus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { useAuth } from '@/hooks/auth';

const PendingApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <AnimatedLogo size={100} withGlow />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
                <CardTitle className="text-2xl">Compte en attente d'activation</CardTitle>
              </div>
              <CardDescription className="text-base">
                Bienvenue {user?.user_metadata?.full_name || user?.email}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Pourquoi mon compte n'est-il pas actif ?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Votre compte a été créé avec succès, mais pour accéder aux services de microfinance, 
                    vous devez d'abord <strong>adhérer à une Structure de Financement Décentralisé (SFD)</strong>.
                  </p>
                </div>
              </div>
              
              <div className="ml-8 space-y-3">
                <h4 className="font-medium text-sm text-foreground">Prochaines étapes :</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Choisissez une SFD parmi celles disponibles dans votre région</li>
                  <li>Soumettez une demande d'adhésion avec vos informations</li>
                  <li>Attendez l'approbation de la SFD (généralement 24-48h)</li>
                  <li>Une fois approuvé, accédez à tous les services (prêts, épargne, etc.)</li>
                </ol>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/mobile-flow/sfd-selector')}
                className="w-full h-12 text-base"
                size="lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Adhérer à une SFD maintenant
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>

              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full"
              >
                Se déconnecter
              </Button>
            </div>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Besoin d'aide ? Contactez le support MEREF
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PendingApprovalPage;
