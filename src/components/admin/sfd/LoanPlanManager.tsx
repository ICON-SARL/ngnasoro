
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Check, X, Loader2 } from 'lucide-react';

interface LoanPlan {
  id: string;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  min_duration: number;
  max_duration: number;
  interest_rate: number;
  fees: number;
  requirements: string[];
  is_active: boolean;
}

const LoanPlanManager = ({ sfdId }: { sfdId: string }) => {
  const { toast } = useToast();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<LoanPlan, 'id'>>({
    name: '',
    description: '',
    min_amount: 10000,
    max_amount: 500000,
    min_duration: 1,
    max_duration: 12,
    interest_rate: 10,
    fees: 2,
    requirements: [],
    is_active: true
  });
  
  const [newRequirement, setNewRequirement] = useState('');
  
  useEffect(() => {
    fetchLoanPlans();
  }, [sfdId]);
  
  const fetchLoanPlans = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', sfdId);
        
      if (error) throw error;
      setLoanPlans(data || []);
    } catch (error: any) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les plans de prêt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      min_amount: 10000,
      max_amount: 500000,
      min_duration: 1,
      max_duration: 12,
      interest_rate: 10,
      fees: 2,
      requirements: [],
      is_active: true
    });
    setNewRequirement('');
    setEditingPlanId(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };
  
  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };
  
  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev, 
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlanId) {
        // Update existing plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPlanId);
          
        if (error) throw error;
        
        toast({
          title: "Plan mis à jour",
          description: "Le plan de prêt a été mis à jour avec succès",
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .insert({
            ...formData,
            sfd_id: sfdId
          });
          
        if (error) throw error;
        
        toast({
          title: "Plan créé",
          description: "Le nouveau plan de prêt a été créé avec succès",
        });
      }
      
      // Refresh loan plans and reset form
      fetchLoanPlans();
      resetForm();
    } catch (error: any) {
      console.error('Error saving loan plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le plan de prêt",
        variant: "destructive",
      });
    }
  };
  
  const handleEdit = (plan: LoanPlan) => {
    setFormData({
      name: plan.name,
      description: plan.description || '',
      min_amount: plan.min_amount,
      max_amount: plan.max_amount,
      min_duration: plan.min_duration,
      max_duration: plan.max_duration,
      interest_rate: plan.interest_rate,
      fees: plan.fees,
      requirements: plan.requirements || [],
      is_active: plan.is_active
    });
    setEditingPlanId(plan.id);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plan de prêt ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Plan supprimé",
        description: "Le plan de prêt a été supprimé avec succès",
      });
      
      fetchLoanPlans();
    } catch (error: any) {
      console.error('Error deleting loan plan:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le plan de prêt",
        variant: "destructive",
      });
    }
  };
  
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: !currentStatus ? "Plan activé" : "Plan désactivé",
        description: !currentStatus 
          ? "Le plan de prêt est maintenant disponible" 
          : "Le plan de prêt n'est plus disponible",
      });
      
      fetchLoanPlans();
    } catch (error: any) {
      console.error('Error toggling loan plan status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du plan",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="list">Plans de prêt</TabsTrigger>
        <TabsTrigger value="create">{editingPlanId ? 'Modifier le plan' : 'Nouveau plan'}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="list">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Plans de prêt configurés</h3>
            {!isLoading && (
              <Button variant="outline" size="sm" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-1" />
                Nouveau plan
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : loanPlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Aucun plan de prêt configuré</p>
              <Button variant="outline" onClick={resetForm}>
                <Plus className="h-4 w-4 mr-1" />
                Créer un plan
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {loanPlans.map((plan) => (
                <Card key={plan.id} className={plan.is_active ? '' : 'opacity-70'}>
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center">
                        {plan.name}
                        {!plan.is_active && (
                          <span className="ml-2 text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">
                            Inactif
                          </span>
                        )}
                      </CardTitle>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Montant:</span>{' '}
                        {plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA
                      </div>
                      <div>
                        <span className="text-muted-foreground">Durée:</span>{' '}
                        {plan.min_duration} - {plan.max_duration} mois
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taux d'intérêt:</span>{' '}
                        {plan.interest_rate}%
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frais:</span> {plan.fees}%
                      </div>
                    </div>
                    
                    {plan.requirements && plan.requirements.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Conditions requises:</h4>
                        <ul className="text-xs pl-4 space-y-1">
                          {plan.requirements.map((req, idx) => (
                            <li key={idx} className="list-disc">{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleActive(plan.id, plan.is_active)}
                      >
                        {plan.is_active ? (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>{editingPlanId ? 'Modifier le plan de prêt' : 'Créer un nouveau plan de prêt'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du plan</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Prêt Microentreprise"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="is_active">Statut</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      {formData.is_active ? 'Actif' : 'Inactif'}
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Description du plan de prêt"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_amount">Montant minimum (FCFA)</Label>
                  <Input
                    id="min_amount"
                    name="min_amount"
                    type="number"
                    min="1000"
                    step="1000"
                    value={formData.min_amount}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_amount">Montant maximum (FCFA)</Label>
                  <Input
                    id="max_amount"
                    name="max_amount"
                    type="number"
                    min="10000"
                    step="10000"
                    value={formData.max_amount}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_duration">Durée minimum (mois)</Label>
                  <Input
                    id="min_duration"
                    name="min_duration"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.min_duration}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max_duration">Durée maximum (mois)</Label>
                  <Input
                    id="max_duration"
                    name="max_duration"
                    type="number"
                    min="1"
                    step="1"
                    value={formData.max_duration}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
                  <Input
                    id="interest_rate"
                    name="interest_rate"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.interest_rate}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fees">Frais (%)</Label>
                  <Input
                    id="fees"
                    name="fees"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fees}
                    onChange={handleNumberChange}
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Conditions requises</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ajouter une condition"
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddRequirement} variant="outline">
                      Ajouter
                    </Button>
                  </div>
                  
                  {formData.requirements.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                          <span className="text-sm">{req}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRequirement(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  {editingPlanId ? 'Mettre à jour' : 'Créer le plan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default LoanPlanManager;
