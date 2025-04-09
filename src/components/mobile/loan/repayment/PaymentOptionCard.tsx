
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PaymentOptionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  onClick: () => void;
}

const PaymentOptionCard: React.FC<PaymentOptionCardProps> = ({
  title,
  description,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  onClick
}) => {
  return (
    <Card className="border hover:border-teal-500 transition-colors cursor-pointer">
      <CardContent className="p-4" onClick={onClick}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full ${iconBgClass} flex items-center justify-center mr-3`}>
              <Icon className={`h-5 w-5 ${iconColorClass}`} />
            </div>
            <div>
              <h4 className="font-medium">{title}</h4>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-teal-500">
            Choisir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentOptionCard;
