import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ErrorBoundary: React.FC = () => {
  const error = useRouteError() as any;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Oups ! Une erreur est survenue
        </h1>
        <p className="text-muted-foreground mb-4">
          {error?.statusText || error?.message || "Page introuvable"}
        </p>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link to="/mobile-flow/dashboard">
              Retour au tableau de bord
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/auth">
              Se reconnecter
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
