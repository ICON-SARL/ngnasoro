
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileMainPage from '@/components/mobile/MobileMainPage';
import MobileLoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import LoanActivityPage from '@/components/mobile/LoanActivityPage';
import LoanProcessPage from '@/components/mobile/LoanProcessPage';
import LoanAgreementPage from '@/components/mobile/LoanAgreementPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const MobileRouter = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Simple placeholder for routes that don't have components yet
  const PlaceholderPage = ({ title }: { title: string }) => {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-4 shadow-sm mb-4">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-gray-500 text-sm">Cette fonctionnalité est en cours de développement</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p>Cette page est en cours de développement et sera bientôt disponible.</p>
          <button 
            onClick={() => toast({
              title: 'Fonctionnalité à venir',
              description: 'Cette fonctionnalité sera disponible prochainement.',
            })}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            En savoir plus
          </button>
        </div>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/main" replace />} />
      <Route path="/main" element={<MobileMainPage />} />
      <Route path="/account" element={<PlaceholderPage title="Mon Compte" />} />
      <Route path="/transfer" element={<PlaceholderPage title="Transfert" />} />
      <Route path="/payment" element={<PlaceholderPage title="Paiement Sécurisé" />} />
      <Route path="/loan-details" element={<MobileLoanDetailsPage />} />
      <Route path="/loans" element={<MobileLoansPage />} />
      <Route path="/my-loans" element={<MobileMyLoansPage />} />
      <Route path="/loan-activity" element={<LoanActivityPage />} />
      <Route path="/loan-process" element={<LoanProcessPage />} />
      <Route path="/loan-agreement" element={<LoanAgreementPage />} />
      <Route path="/loan-application" element={<MobileLoanApplicationPage />} />
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
};
