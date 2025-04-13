import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SfdAccount } from '@/hooks/useSfdAccounts';

interface AccountDetailsSectionProps {
  account: SfdAccount;
}

const AccountDetailsSection: React.FC<AccountDetailsSectionProps> = ({ account }) => {
  const navigate = useNavigate();
  
  // Helper function to check if account is verified
  const canDisplayBalance = (account: SfdAccount) => {
    // Keep the same logic from the original function
    return account && (account.isVerified || account.isDefault);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Détails du compte</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <p className="text-gray-500">SFD</p>
            <p className="font-medium">{account.name}</p>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <p className="text-gray-500">Type de compte</p>
            <p className="font-medium">Compte d'épargne</p>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <p className="text-gray-500">Statut</p>
            <p className="font-medium">
              {canDisplayBalance(account) ? 'Actif' : 'En attente de validation'}
            </p>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <p className="text-gray-500">Date d'ouverture</p>
            <p className="font-medium">01/01/2023</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => navigate('/mobile-flow/account-settings')}
        >
          Paramètres du compte
        </Button>
      </CardContent>
    </Card>
  );
};

export default AccountDetailsSection;
