
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  FileText, 
  Settings, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  AlertTriangle,
  Users,
  CreditCard
} from 'lucide-react';

interface LoanPlan {
  id: string;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
  sfd_id: string;
}

export default function LoanPlansManager() {
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewPlanDialog, setOpenNewPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LoanPlan | null>(null);
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_amount: 10000,
    max_amount: 1000000,
    min_duration: 1,
    max_duration: 36,
    interest_rate: 5.0,
    fees: 1.0,
    requirements: '',
    is_active: true
  });
  
  // Statistiques d'utilisation des plans
  const [planStats, setPlanStats] = useState({
    totalLoans: 0,
    totalClients: 0,
    totalAmount: 0
  });
  
  useEffect(() => {
    fetchLoanPlans();
    fetchPlanStats();
  }, [activeSfdId]);
  
  const fetchLoanPlans = async () => {
    if (!activeSfdId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setLoanPlans(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des plans de prêt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les plans de prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPlanStats = async () => {
    if (!activeSfdId) return;
    
    try {
      // Cette requête est fictive - idéalement, vous récupéreriez les vraies statistiques depuis le backend
      const { data: loansData, error: loansError } = await supabase
        .from('sfd_loans')
        .select('id, amount')
        .eq('sfd_id', activeSfdId);
        
      if (loansError) throw loansError;
      
      // Exemple de calcul de statistiques
      const totalLoans = loansData?.length || 0;
      const totalAmount = loansData?.reduce((sum, loan) => sum + loan.amount, 0) || 0;
      
      // Nombre de clients uniques
      const { data: clientsData, error: clientsError } = await supabase
        .from('sfd_clients')
        .select('id')
        .eq('sfd_id', activeSfdId);
        
      if (clientsError) throw clientsError;
      
      setPlanStats({
        totalLoans,
        totalClients: clientsData?.length || 0,
        totalAmount
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      min_amount: 10000,
      max_amount: 1000000,
      min_duration: 1,
      max_duration: 36,
      interest_rate: 5.0,
      fees: 1.0,
      requirements: '',
      is_active: true
    });
    setEditingPlan(null);
  };
  
  const handleEditPlan = (plan: LoanPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      min_amount: plan.min_amount,
      max_amount: plan.max_amount,
      min_duration: plan.min_duration,
      max_duration: plan.max_duration,
      interest_rate: plan.interest_rate,
      fees: plan.fees,
      requirements: plan.requirements ? plan.requirements.join('\n') : '',
      is_active: plan.is_active
    });
    setOpenNewPlanDialog(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: value === '' ? '' : parseFloat(value) });
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: target.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleCreateOrUpdatePlan = async () => {
    if (!activeSfdId) {
      toast({
        title: 'Erreur',
        description: 'Aucune SFD sélectionnée',
        variant: 'destructive',
      });
      return;
    }
    
    const requirementsArray = formData.requirements
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
    
    const planData = {
      name: formData.name,
      description: formData.description,
      min_amount: formData.min_amount,
      max_amount: formData.max_amount,
      min_duration: formData.min_duration,
      max_duration: formData.max_duration,
      interest_rate: formData.interest_rate,
      fees: formData.fees,
      requirements: requirementsArray,
      is_active: formData.is_active,
      sfd_id: activeSfdId
    };
    
    try {
      if (editingPlan) {
        // Mise à jour d'un plan existant
        const { error } = await supabase
          .from('sfd_loan_plans')
          .update(planData)
          .eq('id', editingPlan.id);
          
        if (error) throw error;
        
        toast({
          title: 'Plan modifié',
          description: `Le plan "${formData.name}" a été mis à jour`,
        });
      } else {
        // Création d'un nouveau plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .insert(planData);
          
        if (error) throw error;
        
        toast({
          title: 'Plan créé',
          description: `Le plan "${formData.name}" a été créé`,
        });
      }
      
      // Rafraîchir la liste des plans
      fetchLoanPlans();
      setOpenNewPlanDialog(false);
      resetForm();
      
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du plan:', error);
      toast({
        title: 'Erreur',
        description: `Erreur lors de la sauvegarde: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleTogglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update({ is_active: !isActive })
        .eq('id', planId);
        
      if (error) throw error;
      
      toast({
        title: 'Statut modifié',
        description: `Le plan a été ${!isActive ? 'activé' : 'désactivé'}`,
      });
      
      fetchLoanPlans();
    } catch (error: any) {
      console.error('Erreur lors de la modification du statut:', error);
      toast({
        title: 'Erreur',
        description: `Erreur: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan de prêt ?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      
      toast({
        title: 'Plan supprimé',
        description: 'Le plan de prêt a été supprimé',
      });
      
      fetchLoanPlans();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur',
        description: `Erreur: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  // Informations sur les plans appliqués à tous les clients
  const InfoPlansGlobaux = () => (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-700">Plans appliqués à tous les clients</h3>
          <p className="text-sm text-blue-600 mt-1">
            Les plans de prêt définis ici s'appliquent à tous les clients de votre SFD. 
            Chaque client aura accès aux mêmes plans et conditions de prêt.
          </p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Plans de Prêts</h2>
        <Button onClick={() => {
          resetForm();
          setOpenNewPlanDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Plan
        </Button>
      </div>
      
      <InfoPlansGlobaux />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total prêts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-[#0D6A51] mr-2" />
              <span className="text-2xl font-bold">{planStats.totalLoans}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-[#0D6A51] mr-2" />
              <span className="text-2xl font-bold">{planStats.totalClients}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Volume prêts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-[#0D6A51] mr-2" />
              <span className="text-2xl font-bold">{planStats.totalAmount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loanPlans.map(plan => (
          <Card key={plan.id} className={!plan.is_active ? 'opacity-70' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleTogglePlanStatus(plan.id, plan.is_active)}
                  >
                    {plan.is_active ? 
                      <X className="h-4 w-4 text-red-500" /> : 
                      <Check className="h-4 w-4 text-green-500" />
                    }
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {!plan.is_active && <span className="text-red-500">[Inactif] </span>}
                {plan.description || 'Aucune description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant:</span>
                  <span>{plan.min_amount.toLocaleString('fr-FR')} - {plan.max_amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée:</span>
                  <span>{plan.min_duration} - {plan.max_duration} mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taux d'intérêt:</span>
                  <span>{plan.interest_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais:</span>
                  <span>{plan.fees}%</span>
                </div>
                
                {plan.requirements && plan.requirements.length > 0 && (
                  <div className="mt-4">
                    <span className="text-xs font-medium text-muted-foreground">Conditions requises:</span>
                    <ul className="list-disc list-inside text-xs mt-1">
                      {plan.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {loanPlans.length === 0 && !loading && (
          <div className="col-span-full text-center p-8">
            <Settings className="h-10 w-10 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Aucun plan de prêt</h3>
            <p className="mt-2 text-muted-foreground">
              Créez votre premier plan de prêt pour commencer à offrir des prêts à vos clients
            </p>
            <Button 
              className="mt-4" 
              onClick={() => {
                resetForm();
                setOpenNewPlanDialog(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Plan
            </Button>
          </div>
        )}
        
        {loading && (
          <div className="col-span-full text-center p-8">
            <div className="animate-spin h-8 w-8 border-2 border-[#0D6A51] border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des plans de prêt...</p>
          </div>
        )}
      </div>
      
      <Dialog open={openNewPlanDialog} onOpenChange={setOpenNewPlanDialog}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Modifier le plan' : 'Créer un nouveau plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Modifiez les informations du plan de prêt existant.' : 'Définissez les paramètres du nouveau plan de prêt.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nom du plan</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ex: Prêt Commercial"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description du plan de prêt"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="min_amount">Montant minimum (FCFA)</Label>
                <Input
                  id="min_amount"
                  name="min_amount"
                  type="number"
                  placeholder="Ex: 10000"
                  value={formData.min_amount}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="max_amount">Montant maximum (FCFA)</Label>
                <Input
                  id="max_amount"
                  name="max_amount"
                  type="number"
                  placeholder="Ex: 1000000"
                  value={formData.max_amount}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="min_duration">Durée minimum (mois)</Label>
                <Input
                  id="min_duration"
                  name="min_duration"
                  type="number"
                  placeholder="Ex: 1"
                  value={formData.min_duration}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="max_duration">Durée maximum (mois)</Label>
                <Input
                  id="max_duration"
                  name="max_duration"
                  type="number"
                  placeholder="Ex: 36"
                  value={formData.max_duration}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
                <Input
                  id="interest_rate"
                  name="interest_rate"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 5.0"
                  value={formData.interest_rate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <Label htmlFor="fees">Frais de dossier (%)</Label>
                <Input
                  id="fees"
                  name="fees"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 1.0"
                  value={formData.fees}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="requirements">Conditions requises (une par ligne)</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Listez les conditions requises (une par ligne)"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              
              <div className="col-span-2 flex items-center space-x-2">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active" className="font-normal">Plan actif</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpenNewPlanDialog(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleCreateOrUpdatePlan}
              className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            >
              {editingPlan ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
