
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TermsPage: React.FC = () => {
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
        <h1 className="text-xl font-semibold">Conditions d'utilisation</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-medium mb-3">Conditions Générales d'Utilisation</h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              Dernière mise à jour : 14/04/2025
            </p>
            
            <p>
              Bienvenue sur N'GNA SÔRÔ!, l'application qui facilite l'accès aux services des Systèmes Financiers Décentralisés (SFD).
              En utilisant notre application, vous acceptez de respecter les présentes conditions d'utilisation.
            </p>
            
            <h3 className="font-medium text-base mt-4">1. Acceptation des conditions</h3>
            <p>
              En créant un compte sur N'GNA SÔRÔ!, vous acceptez d'être lié par les présentes conditions d'utilisation, 
              notre politique de confidentialité et toutes les lois et réglementations applicables.
            </p>
            
            <h3 className="font-medium text-base mt-4">2. Votre compte</h3>
            <p>
              Vous êtes responsable du maintien de la confidentialité de votre compte et mot de passe.
              Vous acceptez d'être responsable de toutes les activités qui se produisent sous votre compte.
            </p>
            
            <h3 className="font-medium text-base mt-4">3. Services financiers</h3>
            <p>
              Notre application permet d'accéder aux services offerts par les SFD. Nous ne sommes pas un établissement financier
              et n'offrons pas directement des services d'épargne ou de crédit. Les transactions sont traitées par les SFD partenaires.
            </p>
            
            <h3 className="font-medium text-base mt-4">4. Limitations de responsabilité</h3>
            <p>
              N'GNA SÔRÔ! ne saurait être tenu responsable des pertes ou dommages résultant de l'utilisation de l'application
              ou des services des SFD partenaires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
