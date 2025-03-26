
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, Key, Settings, Check, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ApiIntegration = () => {
  const integrations = [
    {
      name: 'Stripe',
      description: 'Traitement des paiements internationaux',
      status: 'connected',
      logo: 'https://stripe.com/img/v3/home/social.png',
      lastSync: '22 avril 2023, 14:30',
    },
    {
      name: 'Flutterwave',
      description: 'Passerelle de paiement pour l\'Afrique',
      status: 'connected',
      logo: 'https://flutterwave.com/images/logo/full.svg',
      lastSync: '22 avril 2023, 12:15',
    },
    {
      name: 'Orange Money API',
      description: 'Paiements mobiles pour l\'Afrique de l\'Ouest',
      status: 'error',
      logo: 'https://www.orange.com/sites/all/themes/orange_theme/logo.svg',
      lastSync: '21 avril 2023, 10:45',
      error: 'Erreur d\'authentification',
    },
    {
      name: 'WAVE API',
      description: 'Transferts d\'argent sans frais',
      status: 'pending',
      logo: 'https://wave.com/static/wave-logo.svg',
      lastSync: 'Jamais',
    },
    {
      name: 'MTN Mobile Money',
      description: 'Services financiers mobiles',
      status: 'disconnected',
      logo: 'https://www.mtn.com/wp-content/themes/mtn/assets/images/mtn-logo.svg',
      lastSync: 'Jamais',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Intégration API Bancaires</h2>
          <p className="text-sm text-muted-foreground">
            Connexion avec les systèmes de paiement et services financiers
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Configurer
          </Button>
          <Button>
            <Key className="h-4 w-4 mr-1" />
            Gérer les Clés API
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {integrations.map((integration, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                  <img 
                    src={integration.logo} 
                    alt={`${integration.name} logo`} 
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {integration.status === 'connected' && (
                  <Badge className="bg-green-100 text-green-700">
                    <Check className="h-3 w-3 mr-1" />
                    Connecté
                  </Badge>
                )}
                {integration.status === 'error' && (
                  <Badge className="bg-red-100 text-red-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Erreur
                  </Badge>
                )}
                {integration.status === 'pending' && (
                  <Badge className="bg-amber-100 text-amber-700">
                    En attente
                  </Badge>
                )}
                {integration.status === 'disconnected' && (
                  <Badge className="bg-gray-100 text-gray-700">
                    Déconnecté
                  </Badge>
                )}
                
                <Button 
                  variant={integration.status === 'connected' ? 'outline' : 'default'} 
                  size="sm"
                >
                  {integration.status === 'connected' ? 'Configurer' : 'Connecter'}
                </Button>
              </div>
            </div>
            
            {integration.status === 'connected' && (
              <div className="mt-3 pt-3 border-t text-sm flex justify-between items-center">
                <span className="text-muted-foreground">
                  Dernière synchronisation: {integration.lastSync}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Logs
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Link className="h-4 w-4 mr-1" />
                    Webhooks
                  </Button>
                </div>
              </div>
            )}
            
            {integration.status === 'error' && (
              <div className="mt-3 pt-3 border-t text-sm flex justify-between items-center">
                <span className="text-red-600">
                  Erreur: {integration.error} - Dernière tentative: {integration.lastSync}
                </span>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                  Résoudre
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-[#0D6A51]/5">
          <h3 className="text-lg font-medium mb-2">Transactions API</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Transactions réussies (24h)</span>
              <span className="font-medium">1,284</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Volume total (24h)</span>
              <span className="font-medium">32.5M FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taux de succès</span>
              <span className="font-medium">98.7%</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-[#0D6A51]/5">
          <h3 className="text-lg font-medium mb-2">Méthodes de paiement</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mobile Money</span>
              <span className="font-medium">78%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cartes bancaires</span>
              <span className="font-medium">15%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Transferts bancaires</span>
              <span className="font-medium">7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
