
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Send, User, PlusCircle, Clock, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAccount } from '@/hooks/useAccount';
import { useToast } from '@/hooks/use-toast';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

interface PaymentTabContentProps {
  onBack: () => void;
  onSubmit: (data: { recipient: string, amount: number, note: string }) => void;
}

type RecentContact = {
  name: string;
  avatarText: string;
}

const PaymentTabContent = ({ onBack, onSubmit }: PaymentTabContentProps) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const { account } = useAccount();
  const { toast } = useToast();
  const { activeSfdId } = useSfdDataAccess();
  
  // Mock recent contacts
  const recentContacts: RecentContact[] = [
    { name: 'Mariam Diallo', avatarText: 'MD' },
    { name: 'Amadou Koné', avatarText: 'AK' },
    { name: 'Fatou Touré', avatarText: 'FT' },
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }
    
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }
    
    if (account && amountNumber > account.balance) {
      toast({
        title: "Solde insuffisant",
        description: "Votre solde est insuffisant pour effectuer cette opération",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit({
      recipient,
      amount: amountNumber,
      note
    });
  };

  const handleContactSelect = (contactName: string) => {
    setRecipient(contactName);
  };
  
  const formatCurrency = (balance: number) => {
    return new Intl.NumberFormat('fr-FR').format(balance);
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold">Envoyer de l'argent</h2>
        </div>
      </div>
      
      {/* MEREF Initiative Banner */}
      <div className="mx-4 my-2">
        <Card className="border-[#FFAB2E]/30 bg-[#FFAB2E]/5">
          <CardContent className="p-3 flex items-center space-x-3">
            <Info className="h-5 w-5 text-[#FFAB2E]" />
            <div className="text-xs text-gray-700">
              <span className="font-medium">Service MEREF:</span> Transferts à tarif subventionné via le programme N'GNA SÔRÔ!
            </div>
          </CardContent>
        </Card>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Recipient */}
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-700">Destinataire</label>
          <div className={`relative transition-all ${isFocused === 'recipient' ? 'ring-2 ring-blue-500' : ''}`}>
            <Input
              placeholder="Nom du destinataire"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="border-gray-300 text-lg p-6"
              onFocus={() => setIsFocused('recipient')}
              onBlur={() => setIsFocused(null)}
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Recent contacts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Contacts récents</h3>
            <Button variant="ghost" size="sm" className="text-blue-600 text-xs">
              <Users className="h-3.5 w-3.5 mr-1" />
              Tous les contacts
            </Button>
          </div>
          <div className="flex space-x-4 overflow-x-auto py-2">
            {recentContacts.map((contact) => (
              <div 
                key={contact.name} 
                className="flex flex-col items-center cursor-pointer min-w-[70px]"
                onClick={() => handleContactSelect(contact.name)}
              >
                <Avatar className="h-12 w-12 mb-1 bg-blue-100 hover:bg-blue-200 transition-colors">
                  <span className="text-blue-600">{contact.avatarText}</span>
                </Avatar>
                <span className="text-xs text-gray-600 whitespace-nowrap">
                  {contact.name.split(' ')[0]}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center cursor-pointer min-w-[70px]">
              <Avatar className="h-12 w-12 mb-1 bg-gray-100 hover:bg-gray-200 transition-colors">
                <PlusCircle className="h-6 w-6 text-gray-500" />
              </Avatar>
              <span className="text-xs text-gray-600">Nouveau</span>
            </div>
          </div>
        </div>
        
        {/* Amount */}
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-700">Montant</label>
          <div className={`relative transition-all ${isFocused === 'amount' ? 'ring-2 ring-blue-500' : ''}`}>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-16 text-xl border-gray-300 p-6"
              onFocus={() => setIsFocused('amount')}
              onBlur={() => setIsFocused(null)}
              required
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">
              FCFA
            </span>
          </div>
          
          {account && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 flex items-center">
                <span>Solde disponible:</span> 
                <span className="font-medium ml-1">
                  {formatCurrency(account.balance)} FCFA
                </span>
              </p>
              {activeSfdId && (
                <Badge variant="outline" className="text-xs bg-[#0D6A51]/5 text-[#0D6A51] border-[#0D6A51]/20">
                  Via SFD subventionnée
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Quick amounts */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button 
            type="button"
            variant="outline" 
            className="py-3 font-medium"
            onClick={() => setAmount('5000')}
          >
            5 000 FCFA
          </Button>
          <Button 
            type="button"
            variant="outline" 
            className="py-3 font-medium"
            onClick={() => setAmount('10000')}
          >
            10 000 FCFA
          </Button>
          <Button 
            type="button"
            variant="outline" 
            className="py-3 font-medium"
            onClick={() => setAmount('25000')}
          >
            25 000 FCFA
          </Button>
        </div>
        
        {/* Note */}
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-700">Note (optionnelle)</label>
          <div className={`relative transition-all ${isFocused === 'note' ? 'ring-2 ring-blue-500' : ''}`}>
            <Input
              placeholder="Ajouter une note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border-gray-300 p-6"
              onFocus={() => setIsFocused('note')}
              onBlur={() => setIsFocused(null)}
            />
          </div>
        </div>
        
        {/* Rates information */}
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Transfert MEREF à taux réduit</h4>
          <p className="text-xs text-gray-600">
            Les frais de transfert sont subventionnés par le programme MEREF pour encourager l'inclusion financière.
            <br />Taux: <span className="font-medium text-[#0D6A51]">1.2%</span> (tarif standard: 2.5%)
          </p>
        </div>
        
        {/* Recent transactions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Transactions récentes</h3>
            <Button variant="ghost" size="sm" className="text-blue-600 text-xs">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Historique
            </Button>
          </div>
          <div className="space-y-2">
            <Button 
              type="button"
              variant="ghost" 
              className="w-full justify-start py-3 px-4 text-left border border-gray-100 hover:bg-blue-50 hover:border-blue-100"
              onClick={() => {
                setRecipient('Mariam Diallo');
                setAmount('15000');
                setNote('Remboursement déjeuner');
              }}
            >
              <Avatar className="h-10 w-10 mr-3 bg-purple-100">
                <span className="text-purple-600">MD</span>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">Mariam Diallo</span>
                  <span className="text-blue-600 font-medium">15 000 FCFA</span>
                </div>
                <span className="text-xs text-gray-500">Il y a 2 jours</span>
              </div>
            </Button>
          </div>
        </div>
        
        {/* Recipient summary */}
        {recipient && (
          <Card className="border border-blue-100 bg-blue-50 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3 bg-blue-100">
                  {recipient ? <span className="text-blue-600">{recipient[0]}</span> : <User className="h-5 w-5 text-blue-600" />}
                </Avatar>
                <div>
                  <p className="font-medium">{recipient}</p>
                  <p className="text-sm text-gray-600">Orange Money</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Submit */}
        <div className="sticky bottom-4 pt-4">
          <Button 
            type="submit" 
            className="w-full py-6 bg-blue-600 hover:bg-blue-700" 
            disabled={!recipient || !amount}
          >
            <Send className="mr-2 h-5 w-5" />
            Envoyer {amount ? `${parseInt(amount).toLocaleString('fr-FR')} FCFA` : ''}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentTabContent;
