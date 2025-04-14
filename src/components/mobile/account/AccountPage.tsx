
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 shadow-sm flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/mobile-flow/main')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Mon Compte</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-medium mb-2">Informations personnelles</h2>
          <p className="text-gray-600">Gérez vos informations personnelles et de contact</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-medium mb-2">Sécurité</h2>
          <p className="text-gray-600">Mots de passe et options de sécurité</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-medium mb-2">Préférences</h2>
          <p className="text-gray-600">Personnalisez votre expérience</p>
        </div>
        
        <Button 
          variant="destructive" 
          className="w-full mt-6"
          onClick={() => navigate('/auth')}
        >
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default AccountPage;
