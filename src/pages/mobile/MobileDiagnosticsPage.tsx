import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Wifi, Database, Shield, RefreshCw } from 'lucide-react';

const MobileDiagnosticsPage = () => {
  const { user } = useAuth();
  const { sfdAccounts, isLoading: accountsLoading, error: accountsError, refetch } = useSfdAccounts();
  
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const diagnostics = [
    {
      name: 'Connexion Internet',
      status: isOnline ? 'ok' : 'error',
      icon: Wifi,
      message: isOnline ? 'Connecté' : 'Hors ligne'
    },
    {
      name: 'Authentification',
      status: user ? 'ok' : 'error',
      icon: Shield,
      message: user ? `Connecté en tant que ${user.email}` : 'Non authentifié'
    },
    {
      name: 'Base de données',
      status: accountsError ? 'error' : (accountsLoading ? 'warning' : 'ok'),
      icon: Database,
      message: accountsError ? 'Erreur de connexion' : (accountsLoading ? 'Chargement...' : 'Connecté')
    },
    {
      name: 'Comptes SFD',
      status: sfdAccounts && sfdAccounts.length > 0 ? 'ok' : 'warning',
      icon: AlertCircle,
      message: sfdAccounts ? `${sfdAccounts.length} compte(s) trouvé(s)` : 'Aucun compte'
    }
  ];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge variant="default" className="bg-green-500">OK</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">Attention</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Diagnostics</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
        
        {diagnostics.map((diagnostic) => {
          const Icon = diagnostic.icon;
          return (
            <Card key={diagnostic.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-base">{diagnostic.name}</CardTitle>
                  </div>
                  {getStatusBadge(diagnostic.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getStatusIcon(diagnostic.status)}
                  <span>{diagnostic.message}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {accountsError && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 text-base">Détails de l'erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600">
                {accountsError.message || 'Une erreur est survenue lors de la connexion à la base de données.'}
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informations système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Navigateur :</span>
              <span className="font-medium">{navigator.userAgent.split(' ').slice(-2).join(' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Langue :</span>
              <span className="font-medium">{navigator.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plateforme :</span>
              <span className="font-medium">{navigator.platform}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileDiagnosticsPage;
