
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Info, 
  FileText, 
  HelpCircle, 
  Mail, 
  ExternalLink, 
  Heart, 
  Github
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AboutPage = () => {
  const navigate = useNavigate();
  const appVersion = "1.0.0";
  
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
      
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <img 
              src="/lovable-uploads/11c7df4b-bda8-4b49-b653-6ba0e7d3abad.png" 
              alt="N'GNA SÔRÔ! Logo" 
              className="h-24 w-24 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-center">
            N'GNA <span className="text-[#F97316]">SÔRÔ!</span>
          </h2>
          <p className="text-gray-500 text-sm">Version {appVersion}</p>
        </div>
        
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                <Info className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">À propos de l'application</h3>
                <p className="text-sm text-gray-500">
                  N'GNA SÔRÔ! est une application mobile pour gérer les opérations financières des SFDs au Mali.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/mobile-flow/account/terms')}>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Conditions d'utilisation</h3>
                <p className="text-sm text-gray-500">
                  Lisez nos conditions d'utilisation
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
            
            <Separator />
            
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/mobile-flow/account/privacy')}>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Politique de confidentialité</h3>
                <p className="text-sm text-gray-500">
                  Comment nous protégeons vos données
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
            
            <Separator />
            
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/mobile-flow/account/help')}>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Centre d'aide</h3>
                <p className="text-sm text-gray-500">
                  Questions fréquentes et support
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
            
            <Separator />
            
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = 'mailto:support@ngna-soro.com'}>
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mr-3">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Contacter le support</h3>
                <p className="text-sm text-gray-500">
                  support@ngna-soro.com
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            Fait avec <Heart className="h-3 w-3 mx-1 text-red-500" /> en Côte d'Ivoire
          </p>
          <p className="text-xs text-gray-400 mt-1">© 2025 N'GNA SÔRÔ! Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
