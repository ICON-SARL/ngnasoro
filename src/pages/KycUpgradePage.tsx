import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import KycLevelUpgrade from '@/components/kyc/KycLevelUpgrade';

const KycUpgradePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
      </div>
      <KycLevelUpgrade />
    </div>
  );
};

export default KycUpgradePage;
