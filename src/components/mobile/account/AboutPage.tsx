
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/account')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">À propos</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-5 mb-4">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/90c4efc4-a4a5-4961-a8b7-e5ee8eab2649.png" 
              alt="N'GNA SÔRÔ Logo"
              className="h-20 w-20 object-contain"
            />
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-1">N'GNA SÔRÔ!</h2>
          <p className="text-center text-gray-500 mb-4">Version 1.0.0</p>
          
          <p className="text-gray-700 mb-4">
            N'GNA SÔRÔ! est une application qui permet aux populations d'avoir accès aux services des 
            Systèmes Financiers Décentralisés (SFD) depuis leur téléphone.
          </p>
          
          <p className="text-gray-700 mb-4">
            Notre mission est de faciliter l'inclusion financière et l'accès aux services d'épargne et de crédit 
            pour tous les habitants de la Côte d'Ivoire.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/mobile-flow/account/terms')}
          >
            Conditions d'utilisation
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate('/mobile-flow/account/privacy')}
          >
            Politique de confidentialité
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('https://www.ngnasoro.ci', '_blank')}
          >
            Site web
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
