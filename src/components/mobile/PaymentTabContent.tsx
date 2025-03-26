
import React, { useState } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useAccount } from '@/hooks/useAccount';

interface PaymentTabContentProps {
  onBack: () => void;
  onSubmit: (data: { recipient: string, amount: number, note: string }) => void;
}

const PaymentTabContent = ({ onBack, onSubmit }: PaymentTabContentProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { account } = useAccount();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) return;
    
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) return;
    
    if (account && amountNumber > account.balance) {
      alert('Solde insuffisant');
      return;
    }
    
    onSubmit({
      recipient,
      amount: amountNumber,
      note
    });
  };
  
  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold">Envoyer de l'argent</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Destinataire</label>
          <Input
            placeholder="Nom du destinataire"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Montant</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-12 text-xl"
              required
            />
            <span className="absolute left-3 top-2.5 text-gray-500">FCFA</span>
          </div>
          
          {account && (
            <p className="text-sm text-gray-500">
              Solde disponible: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(account.balance)}
            </p>
          )}
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Note (optionnelle)</label>
          <Input
            placeholder="Ajouter une note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        
        <Card className="border border-blue-100 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3 bg-blue-100">
                {recipient ? <span>{recipient[0]}</span> : <span>?</span>}
              </Avatar>
              <div>
                <p className="font-medium">{recipient || 'Destinataire'}</p>
                <p className="text-sm text-gray-500">Orange Money</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          type="submit" 
          className="w-full py-6" 
          disabled={!recipient || !amount}
        >
          <Send className="mr-2 h-5 w-5" />
          Envoyer {amount ? `${amount} FCFA` : ''}
        </Button>
      </form>
    </div>
  );
};

export default PaymentTabContent;
