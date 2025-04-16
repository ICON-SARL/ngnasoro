import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '@/components/mobile/layout/MobileLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Plus, Building, BadgePercent } from 'lucide-react';

const LoanTypeCard: React.FC<{ 
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
    <CardContent className="p-4 flex items-center">
      <div className="flex-shrink-0 mr-4 p-3 rounded-full bg-[#0D6A51]/10 text-[#0D6A51]">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const MobileLoansPage = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Prêts</h1>
        <p className="text-gray-500 text-sm">Découvrez les options de financement</p>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Services de prêt</h2>
          <LoanTypeCard
            title="Demander un prêt"
            description="Faites une demande de prêt auprès d'une SFD"
            icon={<CreditCard className="h-6 w-6" />}
            onClick={() => navigate('/mobile-flow/loan-plans')}
          />
          
          <LoanTypeCard
            title="Prêt subventionné"
            description="Prêt avec taux d'intérêt réduit grâce à une subvention"
            icon={<BadgePercent className="h-6 w-6" />}
            onClick={() => navigate('/mobile-flow/loan-plans')}
          />
          
          <LoanTypeCard
            title="Prêt d'équipement"
            description="Financement pour l'achat d'équipements agricoles"
            icon={<Building className="h-6 w-6" />}
            onClick={() => navigate('/mobile-flow/loan-plans')}
          />
        </div>
        
        <div className="mt-8 mb-4">
          <Button 
            onClick={() => navigate('/mobile-flow/my-loans')}
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
          >
            Voir mes prêts
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileLoansPage;
