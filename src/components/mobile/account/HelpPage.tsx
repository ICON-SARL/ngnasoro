
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, Mail, MessageSquare } from 'lucide-react';

const HelpPage: React.FC = () => {
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
        <h1 className="text-xl font-semibold">Aide et Support</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-5 mb-4">
          <h2 className="text-lg font-medium mb-3">Comment pouvons-nous vous aider ?</h2>
          
          <div className="space-y-4 mt-6">
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <Phone className="h-5 w-5 text-lime-600 mr-3" />
              <div>
                <p className="font-medium">Service client</p>
                <p className="text-sm text-gray-500">Appelez-nous au +225 XX XX XX XX</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <Mail className="h-5 w-5 text-lime-600 mr-3" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-500">support@ngnasoro.ci</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 border border-gray-200 rounded-lg">
              <MessageSquare className="h-5 w-5 text-lime-600 mr-3" />
              <div>
                <p className="font-medium">Chat en direct</p>
                <p className="text-sm text-gray-500">Discutez avec un conseiller</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-medium mb-3">Questions fréquentes</h2>
          
          <div className="space-y-3 mt-4">
            <div className="border-b border-gray-100 pb-3">
              <p className="font-medium">Comment demander un prêt ?</p>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <p className="font-medium">Comment effectuer un dépôt ?</p>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <p className="font-medium">Comment rembourser mon prêt ?</p>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <p className="font-medium">Comment mettre à jour mes informations ?</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
