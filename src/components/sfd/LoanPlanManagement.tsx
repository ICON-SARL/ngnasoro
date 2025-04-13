
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';

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
  is_active: boolean;
  requirements: string[];
  sfd_id: string;
}

export function LoanPlanManagement() {
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<LoanPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_amount: 10000,
    max_amount: 500000,
    min_duration: 1,
    max_duration: 36,
    interest_rate: 5.0,
    fees: 1.0,
    requirements: '',
    is_active: true
  });

  useEffect(() => {
    if (activeSfdId) {
      fetchLoanPlans();
    }
  }, [activeSfdId]);

  const fetchLoanPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', activeSfdId);

      if (error) throw error;
      setLoanPlans(data || []);
    } catch (error) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans de prêt",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };

  const handleToggleChange = (name: string) => {
    setFormData({
      ...formData,
      [name]: !formData.is_active
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      min_amount: 10000,
      max_amount: 500000,
      min_duration: 1,
      max_duration: 36,
      interest_rate: 5.0,
      fees: 1.0,
      requirements: '',
      is_active: true
    });
    setIsEditMode(false);
    setCurrentPlan(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan: LoanPlan) => {
    setIsEditMode(true);
    setCurrentPlan(plan);
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
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const requirementsArray = formData.requirements
        .split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');

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

      if (isEditMode && currentPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .update(planData)
          .eq('id', currentPlan.id);

        if (error) throw error;
        
        toast({
          title: "Plan modifié",
          description: "Le plan de prêt a été mis à jour avec succès"
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .insert(planData);

        if (error) throw error;
        
        toast({
          title: "Plan créé",
          description: "Le nouveau plan de prêt a été créé avec succès"
        });
      }

      // Refresh loan plans and close dialog
      fetchLoanPlans();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving loan plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le plan de prêt",
        variant: "destructive"
      });
    }
  };

  const togglePlanStatus = async (plan: LoanPlan) => {
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update({ is_active: !plan.is_active })
        .eq('id', plan.id);

      if (error) throw error;
      
      toast({
        title: plan.is_active ? "Plan désactivé" : "Plan activé",
        description: `Le plan "${plan.name}" a été ${plan.is_active ? 'désactivé' : 'activé'}`
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du plan",
        variant: "destructive"
      });
    }
  };

  // Format currency display (FCFA)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Plans de Prêt</h2>
        <Button onClick={openAddDialog} className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
          <Plus className="mr-2 h-4 w-4" /> Nouveau Plan
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-6">Chargement des plans de prêt...</div>
          ) : loanPlans.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Aucun plan de prêt défini. Créez votre premier plan pour commencer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Taux</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loanPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.name}
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {plan.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(plan.min_amount)} - {formatCurrency(plan.max_amount)}
                    </TableCell>
                    <TableCell>
                      {plan.min_duration} - {plan.max_duration} mois
                    </TableCell>
                    <TableCell>{plan.interest_rate}%</TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-300">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => togglePlanStatus(plan)}
                        >
                          {plan.is_active ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? `Modifier le plan: ${currentPlan?.name}` : 'Nouveau plan de prêt'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Nom du plan</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_amount">Montant minimum (FCFA)</Label>
                <Input
                  id="min_amount"
                  name="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={handleInputChange}
                  required
                  min={0}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_amount">Montant maximum (FCFA)</Label>
                <Input
                  id="max_amount"
                  name="max_amount"
                  type="number"
                  value={formData.max_amount}
                  onChange={handleInputChange}
                  required
                  min={formData.min_amount}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_duration">Durée minimum (mois)</Label>
                <Input
                  id="min_duration"
                  name="min_duration"
                  type="number"
                  value={formData.min_duration}
                  onChange={handleInputChange}
                  required
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_duration">Durée maximum (mois)</Label>
                <Input
                  id="max_duration"
                  name="max_duration"
                  type="number"
                  value={formData.max_duration}
                  onChange={handleInputChange}
                  required
                  min={formData.min_duration}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
                <Input
                  id="interest_rate"
                  name="interest_rate"
                  type="number"
                  value={formData.interest_rate}
                  onChange={handleInputChange}
                  required
                  min={0}
                  step={0.1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fees">Frais de dossier (%)</Label>
                <Input
                  id="fees"
                  name="fees"
                  type="number"
                  value={formData.fees}
                  onChange={handleInputChange}
                  required
                  min={0}
                  step={0.1}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <Label htmlFor="requirements">
                  Conditions requises (une par ligne)
                </Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Ex: Pièce d'identité valide&#10;Garantie&#10;Revenus minimums"
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleToggleChange('is_active')}
                    className="w-[100px]"
                  >
                    {formData.is_active ? (
                      <span className="text-green-600">Actif</span>
                    ) : (
                      <span className="text-gray-400">Inactif</span>
                    )}
                  </Button>
                  <Label htmlFor="is_active">
                    Statut du plan
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-[#0D6A51] hover:bg-[#0D6A51]/90">
                {isEditMode ? 'Mettre à jour' : 'Créer le plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
