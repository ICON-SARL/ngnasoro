
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface PaymentOptionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  onClick: () => void;
}

export const PaymentOptionCard: React.FC<PaymentOptionCardProps> = ({
  title,
  description,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  onClick
}) => {
  return (
    <Card 
      className="border border-gray-200 shadow-sm cursor-pointer hover:border-gray-300 transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-full ${iconBgClass}`}>
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
        <div>
          <h4 className="font-medium mb-0.5">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
