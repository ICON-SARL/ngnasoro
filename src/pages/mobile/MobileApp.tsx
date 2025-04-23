
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/mobile/MobileLayout';
import MobileHome from './MobileHome';
import MobileProfile from './MobileProfile';
import MobileNotifications from './MobileNotifications';
import MobileTransactions from './MobileTransactions';
import MobileSettings from './MobileSettings';
import MobileAccountDetails from './MobileAccountDetails';
import MobileHelp from './MobileHelp';
import MobileLocationSettings from './MobileLocationSettings';
import MobileNotificationSettings from './MobileNotificationSettings';
import MobileSecurity from './MobileSecurity';
import SendMoney from './SendMoney';
import ReceiveMoney from './ReceiveMoney';
import QrScanner from './QrScanner';
import SfdConnectionPage from './SfdConnectionPage';
import SfdAdhesionPage from './SfdAdhesionPage';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/utils/apiClient';
import { useToast } from '@/hooks/use-toast';

const MobileApp: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userAccount, setUserAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rediriger vers l'auth si l'utilisateur n'est pas connecté
    if (!user) {
      navigate('/auth');
      return;
    }

    // Charger le compte de l'utilisateur
    const loadUserAccount = async () => {
      try {
        setIsLoading(true);
        const accountData = await apiClient.getClientAccount(user.id);
        setUserAccount(accountData);
      } catch (error) {
        console.error('Error loading user account:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les informations de votre compte',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAccount();

    // Vérifier si une redirection après auth est demandée
    const redirectPath = localStorage.getItem('redirectAfterAuth');
    if (redirectPath) {
      localStorage.removeItem('redirectAfterAuth');
      navigate(redirectPath);
    }
  }, [user, navigate, toast]);

  // Protection des routes si non connecté
  if (!user && location.pathname !== '/auth') {
    return null; // L'utilisateur sera redirigé dans useEffect
  }

  return (
    <Routes>
      <Route path="/" element={<MobileLayout />}>
        {/* Main tabs */}
        <Route index element={<MobileHome userAccount={userAccount} isLoading={isLoading} />} />
        <Route path="profile" element={<MobileProfile />} />
        <Route path="notifications" element={<MobileNotifications />} />
        <Route path="transactions" element={<MobileTransactions />} />
        
        {/* Account sub-routes */}
        <Route path="settings" element={<MobileSettings />} />
        <Route path="account-details" element={<MobileAccountDetails />} />
        <Route path="help" element={<MobileHelp />} />
        <Route path="location-settings" element={<MobileLocationSettings />} />
        <Route path="notification-settings" element={<MobileNotificationSettings />} />
        <Route path="security" element={<MobileSecurity />} />
        
        {/* Transaction routes */}
        <Route path="send-money" element={<SendMoney />} />
        <Route path="receive-money" element={<ReceiveMoney />} />
        <Route path="scan" element={<QrScanner />} />
        
        {/* SFD related routes */}
        <Route path="sfd-connection" element={<SfdConnectionPage />} />
        <Route path="sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
      </Route>
    </Routes>
  );
};

export default MobileApp;
