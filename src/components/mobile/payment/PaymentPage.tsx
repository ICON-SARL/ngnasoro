
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

interface PaymentPageProps {
  onPaymentSubmit: (data: { recipient: string; amount: number; note: string }) => Promise<void>;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentSubmit }) => {
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    recipient: '',
    amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {
      recipient: !recipient ? 'Le destinataire est requis' : '',
      amount: !amount || parseFloat(amount) <= 0 ? 'Veuillez entrer un montant valide' : '',
    };
    
    setErrors(newErrors);
    
    if (newErrors.recipient || newErrors.amount) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onPaymentSubmit({
        recipient,
        amount: parseFloat(amount),
        note
      });
      
      navigate('/mobile-flow/main');
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20 font-montserrat">
      <div className="bg-white py-2 sticky top-0 z-10 border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-4" 
          onClick={() => navigate('/mobile-flow/main')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>
      
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-[#0D6A51] mb-4">Envoyer de l'argent</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient">Destinataire</Label>
            <Input
              id="recipient"
              placeholder="Nom du destinataire"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            {errors.recipient && <p className="text-red-500 text-sm">{errors.recipient}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (FCFA)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Note (optionnel)</Label>
            <Textarea
              id="note"
              placeholder="Ajouter une note pour le destinataire"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Traitement en cours...
              </>
            ) : (
              'Envoyer'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
