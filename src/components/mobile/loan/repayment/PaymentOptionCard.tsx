
import React from 'react';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface PaymentOptionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgClass?: string;
  iconColorClass?: string;
  onClick?: () => void;
}

const PaymentOptionCard = ({
  title,
  description,
  icon: Icon,
  iconBgClass = "bg-green-100",
  iconColorClass = "text-green-600",
  onClick
}: PaymentOptionCardProps) => {
  return (
    <Card
      className="flex items-center p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className={`rounded-full p-3 mr-4 ${iconBgClass}`}>
        <Icon className={`h-6 w-6 ${iconColorClass}`} />
      </div>
      <div className="flex-1">
        <h4 className="text-lg font-medium">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Card>
  );
};

export default PaymentOptionCard;
