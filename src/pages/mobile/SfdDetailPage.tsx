
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, ExternalLink, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SfdDetailPage: React.FC = () => {
  const { sfdId } = useParams<{ sfdId: string }>();
  const navigate = useNavigate();
  
  // Données simulées pour les SFDs disponibles
  const sfdsData = {
    'troisieme-sfd': {
      name: 'Troisième SFD',
      code: 'SFD3',
      region: 'Sikasso',
      description: 'Institution de microfinance active dans la région de Sikasso, spécialisée dans le financement agricole.',
      phone: '+223 65 84 12 33',
      email: 'contact@troisieme-sfd.ml',
      address: 'Rue 120, Porte 25, Sikasso, Mali'
    },
    'caurie-mf': {
      name: 'CAURIE-MF',
      code: 'CAURIE',
      region: 'Bamako',
      description: 'CAURIE-MF est une institution de microfinance qui offre des services financiers aux entrepreneurs et aux petites entreprises à Bamako.',
      phone: '+223 71 23 45 67',
      email: 'info@caurie-mf.ml',
      address: 'Avenue de la République, Bamako, Mali'
    },
    'nyesigiso': {
      name: 'Nyèsigiso',
      code: 'NYE',
      region: 'Ségou',
      description: 'Réseau d\'institutions financières mutualistes au service des populations maliennes depuis plus de 25 ans.',
      phone: '+223 76 54 32 10',
      email: 'contact@nyesigiso.ml',
      address: 'Rue Famolo Coulibaly, Ségou, Mali'
    },
    'kafo-jiginew': {
      name: 'Kafo Jiginew',
      code: 'KAFO',
      region: 'Koulikoro',
      description: 'Premier réseau de caisses d\'épargne et de crédit au Mali, fondé en 1987.',
      phone: '+223 66 77 88 99',
      email: 'support@kafojiginew.ml',
      address: 'BP 47, Koulikoro, Mali'
    },
    'soro-yiriwaso': {
      name: 'Soro Yiriwaso',
      code: 'SORO',
      region: 'Bamako',
      description: 'Institution de microfinance spécialisée dans le financement des micro-entreprises et du développement urbain.',
      phone: '+223 60 12 34 56',
      email: 'info@soroyiriwaso.ml',
      address: 'Hamdallaye ACI 2000, Bamako, Mali'
    },
    'miselini': {
      name: 'Miselini',
      code: 'MISE',
      region: 'Sikasso',
      description: 'Miselini est une institution de microfinance qui soutient les activités génératrices de revenu dans la région de Sikasso.',
      phone: '+223 79 88 77 66',
      email: 'service@miselini.ml',
      address: 'Quartier Wayerma, Sikasso, Mali'
    }
  };
  
  const sfd = sfdsData[sfdId as keyof typeof sfdsData] || {
    name: 'SFD Inconnue',
    code: '---',
    region: 'Inconnu',
    description: 'Information non disponible',
    phone: 'Non disponible',
    email: 'Non disponible',
    address: 'Non disponible'
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-[#0D6A51] text-white p-4 flex items-center shadow-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 text-white hover:bg-[#0D6A51]/20" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{sfd.name}</h1>
      </div>
      
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-[#0D6A51]/10 rounded-full flex items-center justify-center mr-3">
                <Building className="h-6 w-6 text-[#0D6A51]" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{sfd.name}</h2>
                <p className="text-gray-500">{sfd.code} · {sfd.region}</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4">{sfd.description}</p>
            
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span>{sfd.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span>{sfd.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span>{sfd.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full bg-[#0D6A51]">
            Demander un prêt
          </Button>
          <Button variant="outline" className="w-full">
            Voir la page web <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-lg mb-3">Services disponibles</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#0D6A51] mr-2"></div>
                <span>Microcrédits agricoles</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#0D6A51] mr-2"></div>
                <span>Épargne sécurisée</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#0D6A51] mr-2"></div>
                <span>Transferts d'argent</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#0D6A51] mr-2"></div>
                <span>Formation financière</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SfdDetailPage;
