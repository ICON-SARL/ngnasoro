
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { Button } from '@/components/ui/button';
import { CreditCard, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Accueil</h1>
      </div>

      <div className="p-4">
        {/* Prêts Section */}
        <section className="mb-6">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-[#0D6A51]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Prêts</h2>
                    <p className="text-sm text-gray-500">Gérez vos prêts</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#0D6A51]"
                  onClick={() => navigate('/mobile-flow/loans')}
                >
                  <span className="text-sm">Voir tout</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-4">
                <Button
                  className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  onClick={() => navigate('/mobile-flow/loans')}
                >
                  Demander un prêt
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default MobileHomePage;
