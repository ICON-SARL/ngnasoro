
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send } from 'lucide-react';

interface PaymentPageProps {
  onPaymentSubmit: (data: { recipient: string, amount: number, note: string }) => Promise<void>;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentSubmit }) => {
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      
      // Navigate will be handled by the parent component after successful payment
    } catch (error) {
      console.error('Payment failed:', error);
      setIsLoading(false);
    }
  };

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
          <h1 className="text-xl font-bold">Effectuer un paiement</h1>
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
                <Send className="mr-2 h-4 w-4" />
                Envoyer
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
