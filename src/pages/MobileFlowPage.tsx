import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import MobileMainPage from '@/components/mobile/MobileMainPage';
import TransferPage from '@/pages/mobile/TransferPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import LoanDetailsPage from '@/pages/mobile/LoanDetailsPage';
import PaymentPage from '@/pages/mobile/PaymentPage';
import AccountPage from '@/pages/mobile/AccountPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';

const MobileFlowPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Services Mobile" />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="main" replace />} />
          <Route path="/main" element={<MobileMainPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/loans" element={<MobileLoansPage />} />
          <Route path="/my-loans" element={<MobileMyLoansPage />} />
          <Route path="/loan-details" element={<LoanDetailsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
          <Route path="*" element={
            <Card>
              <CardContent className="p-4 text-center">
                <h2 className="text-xl font-semibold mb-2">Page non trouvée</h2>
                <p className="text-muted-foreground">
                  La page que vous recherchez n'existe pas dans le flux mobile.
                </p>
              </CardContent>
            </Card>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default MobileFlowPage;
