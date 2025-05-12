
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLoanApplication } from '@/hooks/useLoanApplication';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SFD {
  id: string;
  name: string;
  logo_url?: string;
}

const MobileLoanApplicationForm: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { submitApplication, isUploading } = useLoanApplication();
  
  // Récupérer les paramètres de l'état
  const planId = location.state?.planId;
  const sfdId = location.state?.sfdId;
  
  const [sfdList, setSfdList] = useState<SFD[]>([]);
  const [selectedSfd, setSelectedSfd] = useState<SFD | null>(null);
  const [isLoadingSfds, setIsLoadingSfds] = useState(false);
  const [isLoadingPlanInfo, setIsLoadingPlanInfo] = useState(false);
  
  const [formData, setFormData] = useState({
    sfd_id: sfdId || '',
    amount: '',
    duration_months: '',
    purpose: '',
    loan_plan_id: planId || '1', // Utiliser le plan ID passé ou valeur par défaut
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Si nous avons un planId, récupérer les informations du plan (y compris la SFD)
    const fetchPlanInfo = async () => {
      if (planId) {
        setIsLoadingPlanInfo(true);
        try {
          const { data: planData, error: planError } = await supabase
            .from('sfd_loan_plans')
            .select(`
              *,
              sfds:sfd_id (
                id,
                name,
                logo_url
              )
            `)
            .eq('id', planId)
            .single();
            
          if (planError) throw planError;
          
          if (planData && planData.sfds) {
            // Définir la SFD associée au plan
            setSelectedSfd(planData.sfds);
            setFormData(prev => ({ 
              ...prev, 
              sfd_id: planData.sfds.id,
              min_amount: planData.min_amount,
              max_amount: planData.max_amount,
              min_duration: planData.min_duration,
              max_duration: planData.max_duration
            }));
          }
        } catch (error) {
          console.error('Error fetching loan plan:', error);
        } finally {
          setIsLoadingPlanInfo(false);
        }
      }
      // Si nous avons un sfdId mais pas de planId, récupérer les informations de la SFD
      else if (sfdId) {
        setIsLoadingPlanInfo(true);
        try {
          const { data: sfdData, error: sfdError } = await supabase
            .from('sfds')
            .select('id, name, logo_url')
            .eq('id', sfdId)
            .single();
            
          if (sfdError) throw sfdError;
          
          if (sfdData) {
            setSelectedSfd(sfdData);
          }
        } catch (error) {
          console.error('Error fetching SFD info:', error);
        } finally {
          setIsLoadingPlanInfo(false);
        }
      }
    };
    
    fetchPlanInfo();
  }, [planId, sfdId]);
  
  // Fetch available SFDs only if no plan or SFD is specified
  useEffect(() => {
    if (!sfdId && !planId) {
      const fetchSfds = async () => {
        setIsLoadingSfds(true);
        try {
          const { data, error } = await supabase
            .from('sfds')
            .select('id, name, logo_url')
            .eq('status', 'active')
            .order('name');
            
          if (error) throw error;
          setSfdList(data || []);
        } catch (error) {
          console.error('Error fetching SFDs:', error);
          toast({
            title: "Erreur",
            description: "Impossible de charger la liste des SFDs",
            variant: "destructive",
          });
        } finally {
          setIsLoadingSfds(false);
        }
      };
      
      fetchSfds();
    }
  }, [toast, sfdId, planId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si le champ est sfd_id, mettre à jour le SFD sélectionné
    if (name === 'sfd_id') {
      const selected = sfdList.find(sfd => sfd.id === value);
      if (selected) setSelectedSfd(selected);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sfd_id) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une SFD",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.duration_months) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une durée",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.purpose) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer l'objet du prêt",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitApplication.mutateAsync({
        sfd_id: formData.sfd_id,
        amount: Number(formData.amount),
        duration_months: Number(formData.duration_months),
        purpose: formData.purpose,
        loan_plan_id: formData.loan_plan_id,
        documents: []
      });
      
      toast({
        title: "Demande envoyée",
        description: "Votre demande de prêt a été envoyée avec succès à la SFD",
      });
      
      navigate('/mobile-flow/my-loans');
    } catch (error: any) {
      console.error('Loan application error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi de votre demande",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* N'afficher le sélecteur de SFD que si aucun plan/SFD n'est prédéfini */}
          {!selectedSfd ? (
            <div>
              <label className="block text-sm font-medium mb-1">SFD *</label>
              <Select
                value={formData.sfd_id}
                onValueChange={(value) => handleSelectChange('sfd_id', value)}
                disabled={isLoadingSfds}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingSfds ? "Chargement..." : "Sélectionner une SFD"} />
                </SelectTrigger>
                <SelectContent>
                  {sfdList.map((sfd) => (
                    <SelectItem key={sfd.id} value={sfd.id}>
                      {sfd.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">SFD</label>
              <div className="flex items-center p-2 border rounded bg-gray-50">
                {selectedSfd.logo_url && (
                  <img 
                    src={selectedSfd.logo_url} 
                    alt={selectedSfd.name} 
                    className="h-6 w-6 mr-2 object-contain"
                  />
                )}
                <span>{selectedSfd.name}</span>
              </div>
              <input type="hidden" name="sfd_id" value={formData.sfd_id} />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Montant (FCFA) *</label>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Exemple: 50000"
              min="10000"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 10,000 FCFA</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Durée (mois) *</label>
            <Select
              value={formData.duration_months}
              onValueChange={(value) => handleSelectChange('duration_months', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une durée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 mois</SelectItem>
                <SelectItem value="6">6 mois</SelectItem>
                <SelectItem value="12">12 mois</SelectItem>
                <SelectItem value="24">24 mois</SelectItem>
                <SelectItem value="36">36 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Objet du prêt *</label>
            <Textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Pourquoi avez-vous besoin de ce prêt?"
              rows={3}
            />
          </div>
          
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting || isUploading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Traitement en cours...
                </span>
              ) : (
                "Soumettre la demande"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MobileLoanApplicationForm;
