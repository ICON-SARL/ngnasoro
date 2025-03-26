
import React from 'react';
import { Card, CardContent } from './ui/card';
import { Wallet, Home, User, Calendar, CreditCard, Landmark, Clock } from 'lucide-react';

interface IconMenuItem {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
}

const IconographicUI = () => {
  const menuItems: IconMenuItem[] = [
    {
      icon: <Wallet className="h-10 w-10 text-primary" />,
      label: "Demander un prêt",
      description: "Obtenez un prêt rapidement",
      action: () => console.log('Navigate to loan request')
    },
    {
      icon: <Clock className="h-10 w-10 text-amber-500" />,
      label: "Historique",
      description: "Voir vos transactions",
      action: () => console.log('Navigate to history')
    },
    {
      icon: <Landmark className="h-10 w-10 text-emerald-500" />,
      label: "Épargne",
      description: "Gérer votre épargne",
      action: () => console.log('Navigate to savings')
    },
    {
      icon: <CreditCard className="h-10 w-10 text-violet-500" />,
      label: "Remboursement",
      description: "Rembourser votre prêt",
      action: () => console.log('Navigate to repayment')
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Que souhaitez-vous faire?</h2>
      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item, index) => (
          <Card 
            key={index} 
            className="border-2 hover:border-primary cursor-pointer transition-all"
            onClick={item.action}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <div className="mb-3 mt-3">{item.icon}</div>
              <h3 className="font-bold">{item.label}</h3>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IconographicUI;
