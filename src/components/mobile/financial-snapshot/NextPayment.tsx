
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface NextPaymentProps {
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

const NextPayment: React.FC<NextPaymentProps> = ({
  nextPaymentDate,
  nextPaymentAmount = 0
}) => {
  if (!nextPaymentDate) {
    return (
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">Prochain paiement</p>
        <p className="text-base">Aucun paiement prévu</p>
      </div>
    );
  }

  const formattedDate = () => {
    try {
      const date = new Date(nextPaymentDate);
      return format(date, 'd MMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-500">Prochain paiement</p>
      <div className="flex items-center gap-2 mt-1">
        <Calendar className="h-5 w-5 text-amber-500" />
        <div>
          <p className="text-base font-medium">{formattedDate()}</p>
          {nextPaymentAmount > 0 && (
            <p className="text-sm text-gray-600">{nextPaymentAmount.toLocaleString('fr-FR')} FCFA</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextPayment;
