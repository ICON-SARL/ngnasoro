
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';

interface SecurePaymentPageProps {
  onPaymentSubmit: (data: { recipient: string, amount: number, note: string }) => Promise<void>;
}

const SecurePaymentPage: React.FC<SecurePaymentPageProps> = ({ onPaymentSubmit }) => {
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    recipient?: string;
    amount?: string;
  }>({});

  const handleGoBack = () => {
    navigate('/mobile-flow/main');
  };

  const validateForm = () => {
    const newErrors: {
      recipient?: string;
      amount?: string;
    } = {};

    if (!recipient.trim()) {
      newErrors.recipient = 'Le destinataire est requis';
    }

    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue)) {
      newErrors.amount = 'Montant invalide';
    } else if (amountValue <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onPaymentSubmit({
        recipient,
        amount: parseFloat(amount),
        note
      });
      
      setSuccess(true);
      
      // Reset the form after a successful payment
      setTimeout(() => {
        navigate('/mobile-flow/main');
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Paiement réussi</h2>
          <p className="text-gray-600 mb-6">
            Votre paiement de {parseFloat(amount).toLocaleString()} FCFA à {recipient} a été effectué avec succès.
          </p>
          <Button 
            className="w-full bg-[#0D6A51] hover:bg-[#074D3B]"
            onClick={() => navigate('/mobile-flow/main')}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#0D6A51] to-[#064335] p-4 text-white">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Paiement sécurisé</h1>
        </div>
      </div>
      
      {/* Security Info */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-700">
            Cette transaction est protégée par le protocole de sécurité avancé.
          </p>
        </div>
      </div>
      
      {/* Payment Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Destinataire</label>
            <Input
              placeholder="Nom ou numéro du destinataire"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className={errors.recipient ? 'border-red-500' : ''}
            />
            {errors.recipient && (
              <p className="text-red-500 text-xs mt-1">{errors.recipient}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Note (optionnel)</label>
            <Textarea
              placeholder="Ajouter une note au paiement"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Shield className="h-4 w-4 text-[#0D6A51] mr-1" />
              Protection de la transaction
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Authentification à deux facteurs activée</li>
              <li>• Données cryptées de bout en bout</li>
              <li>• Transaction vérifiée par le système de sécurité</li>
            </ul>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#074D3B]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                Traitement...
              </div>
            ) : (
              <div className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Payer en toute sécurité
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SecurePaymentPage;
