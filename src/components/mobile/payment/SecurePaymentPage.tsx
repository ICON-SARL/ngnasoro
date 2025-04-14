
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CreditCard, Send } from 'lucide-react';

const SecurePaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation would go here
    navigate('/mobile-flow/main');
  };
  
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
        <h1 className="text-xl font-semibold">Paiement sécurisé</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-5 mb-4">
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 bg-lime-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-lime-600" />
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant (FCFA)
              </label>
              <Input
                type="number"
                placeholder="Entrez le montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataire
              </label>
              <Input
                type="text"
                placeholder="Nom du destinataire ou numéro"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (optionnel)
              </label>
              <Input
                type="text"
                placeholder="Ajoutez une note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-lime-600 hover:bg-lime-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Effectuer le paiement
            </Button>
          </form>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 flex items-start">
          <div className="text-blue-600 mt-1 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-blue-800">
            Vos paiements sont sécurisés et protégés par notre système de chiffrement avancé.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurePaymentPage;
