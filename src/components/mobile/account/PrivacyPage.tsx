
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/account/about')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Politique de confidentialité</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-medium mb-3">Politique de confidentialité</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              Dernière mise à jour : 14/04/2025
            </p>
            
            <p>
              Chez N'GNA SÔRÔ!, nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique
              explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre application.
            </p>
            
            <h3 className="font-medium text-base mt-4">1. Informations collectées</h3>
            <p>
              Nous collectons des informations personnelles telles que votre nom, adresse, numéro de téléphone,
              adresse e-mail et documents d'identité, nécessaires pour créer votre compte et faciliter l'accès aux services des SFD.
            </p>
            
            <h3 className="font-medium text-base mt-4">2. Utilisation des informations</h3>
            <p>
              Nous utilisons vos informations pour faciliter votre accès aux services des SFD, traiter vos transactions,
              vous informer sur vos activités sur l'application et améliorer nos services.
            </p>
            
            <h3 className="font-medium text-base mt-4">3. Partage des informations</h3>
            <p>
              Vos informations peuvent être partagées avec les SFD partenaires pour vous permettre d'accéder à leurs services.
              Nous ne vendons pas vos données à des tiers à des fins commerciales.
            </p>
            
            <h3 className="font-medium text-base mt-4">4. Sécurité des données</h3>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
              contre tout accès non autorisé, altération, divulgation ou destruction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
