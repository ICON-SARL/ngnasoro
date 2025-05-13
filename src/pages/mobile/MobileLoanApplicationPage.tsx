
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import MobileLoanApplicationForm from '@/components/mobile/loan/MobileLoanApplicationForm';
import { useSfdLoanPlans } from '@/hooks/useSfdLoanPlans';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const MobileLoanApplicationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [planData, setPlanData] = useState<any>(null);
  const [sfdName, setSfdName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Get plan and SFD IDs from location state
  const planId = location.state?.planId;
  const sfdId = location.state?.sfdId;
  
  // Redirect if user is not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch plan and SFD info if available
  useEffect(() => {
    const fetchPlanAndSfdInfo = async () => {
      if (!planId && !sfdId) return;
      
      setIsLoading(true);
      
      try {
        // If we have a plan ID, fetch plan info first
        if (planId) {
          const { data, error } = await supabase
            .from('sfd_loan_plans')
            .select(`
              *,
              sfds:sfd_id (name, logo_url)
            `)
            .eq('id', planId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            console.log("Fetched plan data:", data);
            setPlanData(data);
            if (data.sfds) {
              setSfdName(data.sfds.name);
            }
          }
        } 
        // Otherwise just fetch SFD info
        else if (sfdId) {
          const { data, error } = await supabase
            .from('sfds')
            .select('name')
            .eq('id', sfdId)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setSfdName(data.name);
          }
        }
      } catch (err) {
        console.error("Error fetching plan or SFD info:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanAndSfdInfo();
  }, [planId, sfdId]);

  // Handle back button press
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-2" 
            onClick={handleBack}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Demande de Prêt</h1>
            {sfdName && (
              <p className="text-sm text-white/80">{sfdName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {planData ? `Demande - ${planData.name}` : 'Informations sur le Prêt'}
          </h2>
          <p className="text-sm text-gray-600">
            {planData ? 
              `Taux d'intérêt: ${planData.interest_rate}% - Durée: ${planData.min_duration} à ${planData.max_duration} mois` : 
              'Veuillez remplir le formulaire ci-dessous pour soumettre votre demande de prêt. Tous les champs marqués d\'un astérisque (*) sont obligatoires.'
            }
          </p>
        </div>

        <MobileLoanApplicationForm planId={planId} sfdId={sfdId} />
      </div>
    </div>
  );
};

export default MobileLoanApplicationPage;
