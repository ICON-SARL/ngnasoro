
import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

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
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-all duration-200" 
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className={`h-10 w-10 rounded-full ${iconBgClass} flex items-center justify-center mr-3`}>
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </Card>
  );
};

export default PaymentOptionCard;
