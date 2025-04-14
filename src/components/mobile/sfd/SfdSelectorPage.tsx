
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SfdSelectorPage: React.FC = () => {
  const navigate = useNavigate();
  
  const sfdList = [
    {
      id: 1,
      name: "SFD Côte d'Ivoire",
      location: "Abidjan, Plateau",
      rating: 4.5,
      members: 5000
    },
    {
      id: 2,
      name: "Microcred Bouaké",
      location: "Bouaké, Centre",
      rating: 4.2,
      members: 3200
    },
    {
      id: 3,
      name: "Crédit Rural San Pedro",
      location: "San Pedro",
      rating: 4.0,
      members: 2800
    },
    {
      id: 4,
      name: "Finance Solidaire Korhogo",
      location: "Korhogo",
      rating: 4.3,
      members: 1900
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Sélection SFD</h1>
      </div>
      
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un SFD par nom ou région"
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">SFD disponibles</h2>
          <Button size="sm" variant="link" className="text-lime-600">
            <MapPin className="h-4 w-4 mr-1" />
            Près de moi
          </Button>
        </div>
        
        <div className="space-y-3">
          {sfdList.map(sfd => (
            <div 
              key={sfd.id} 
              className="bg-white rounded-lg shadow p-4"
              onClick={() => navigate(`/mobile-flow/sfd-adhesion/${sfd.id}`)}
            >
              <div className="flex items-center">
                <div className="h-12 w-12 bg-lime-100 rounded-full flex items-center justify-center mr-3">
                  <Building className="h-6 w-6 text-lime-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{sfd.name}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{sfd.location}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs font-medium bg-lime-50 text-lime-700 px-2 py-0.5 rounded mb-1">
                    {sfd.rating} ★
                  </div>
                  <div className="text-xs text-gray-500">
                    {sfd.members.toLocaleString()} clients
                  </div>
                </div>
              </div>
              
              <div className="mt-3 flex justify-end">
                <Button 
                  size="sm"
                  className="bg-lime-600 hover:bg-lime-700 text-white"
                  onClick={() => navigate(`/mobile-flow/sfd-adhesion/${sfd.id}`)}
                >
                  Adhérer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SfdSelectorPage;
