
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export interface PaymentTabContentProps {
  onSubmit: (data: { recipient: string; amount: number; note: string }) => Promise<void>;
  onBack?: () => void;
}

const PaymentTabContent: React.FC<PaymentTabContentProps> = ({ onSubmit, onBack }) => {
  const navigate = useNavigate();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ recipient, amount: Number(amount), note });
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="p-1 mr-3" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Envoyer de l'argent</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Destinataire</label>
          <Input 
            placeholder="Nom ou numéro du bénéficiaire"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
          <Input 
            type="number" 
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Note (facultative)</label>
          <Textarea 
            placeholder="Ex: Remboursement déjeuner"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-6 flex items-center justify-center"
          disabled={isSubmitting || !recipient || !amount}
        >
          <Send className="mr-2 h-4 w-4" /> 
          Envoyer
        </Button>
      </form>
    </div>
  );
};

export default PaymentTabContent;
