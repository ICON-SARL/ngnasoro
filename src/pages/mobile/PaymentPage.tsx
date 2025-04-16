
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MobileHeader from '@/components/mobile/MobileHeader';

const PaymentPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Paiement" />
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-4">
            {/* Le contenu complet sera implémenté dans une prochaine étape */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
