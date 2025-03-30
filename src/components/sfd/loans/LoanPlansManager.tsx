
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, AlertCircle, Calendar, CreditCard, Percent, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface LoanPlan {
  id?: string;
  sfd_id: string;
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
  created_at?: string;
}

export default function LoanPlansManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [editingPlan, setEditingPlan] = useState<LoanPlan | null>(null);
  
  // New loan plan form state
  const emptyloanPlan: LoanPlan = {
    sfd_id: user?.sfd_id || '',
    name: '',
    description: '',
    min_amount: 50000,
    max_amount: 5000000,
    min_duration: 3,
    max_duration: 36,
    interest_rate: 5.5,
    fees: 2.0,
    requirements: [],
    is_active: true
  };
  
  const [formData, setFormData] = useState<LoanPlan>(emptyloanPlan);
  const [requirementsText, setRequirementsText] = useState('');

  useEffect(() => {
    fetchLoanPlans();
  }, [user, activeTab]);

  const fetchLoanPlans = async () => {
    if (!user?.sfd_id) return;
    
    setLoading(true);
    try {
      const isActive = activeTab === 'active';
      
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', user.sfd_id)
        .eq('is_active', isActive)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLoanPlans(data || []);
    } catch (error) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les plans de prêt',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (['min_amount', 'max_amount', 'min_duration', 'max_duration', 'interest_rate', 'fees'].includes(name)) {
      setFormData({ ...formData, [name]: parseFloat(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRequirementsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequirementsText(e.target.value);
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, is_active: checked });
  };

  const handleCreateOrUpdate = async () => {
    try {
      // Parse requirements from text area (one requirement per line)
      const requirements = requirementsText
        .split('\n')
        .map(req => req.trim())
        .filter(req => req.length > 0);
      
      const planData = { ...formData, requirements };
      
      let result;
      
      if (editingPlan?.id) {
        // Update existing plan
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .update(planData)
          .eq('id', editingPlan.id)
          .select();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: 'Plan de prêt mis à jour',
          description: 'Le plan de prêt a été modifié avec succès',
        });
      } else {
        // Insert new plan
        const { data, error } = await supabase
          .from('sfd_loan_plans')
          .insert(planData)
          .select();
          
        if (error) throw error;
        result = data;
        
        toast({
          title: 'Plan de prêt créé',
          description: 'Le nouveau plan de prêt a été créé avec succès',
        });
      }
      
      setOpenDialog(false);
      resetForm();
      fetchLoanPlans();
      
    } catch (error) {
      console.error('Error saving loan plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le plan de prêt',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (plan: LoanPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setRequirementsText(plan.requirements.join('\n'));
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Plan de prêt supprimé',
        description: 'Le plan de prêt a été supprimé avec succès',
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Error deleting loan plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le plan de prêt',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData(emptyloanPlan);
    setRequirementsText('');
  };

  const handleOpenNewPlan = () => {
    resetForm();
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Plans de Prêts</h2>
          <p className="text-sm text-muted-foreground">
            Configurez les plans de prêt proposés aux clients
          </p>
        </div>
        
        <Button onClick={handleOpenNewPlan}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Plan de Prêt
        </Button>
      </div>
      
      <Tabs defaultValue="active" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Plans Actifs</TabsTrigger>
          <TabsTrigger value="inactive">Plans Inactifs</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loading ? (
            <div className="text-center py-8">Chargement des plans de prêt...</div>
          ) : loanPlans.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Aucun plan de prêt actif</p>
              <Button variant="outline" className="mt-4" onClick={handleOpenNewPlan}>
                Créer un nouveau plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loanPlans.map(plan => (
                <Card key={plan.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                        Actif
                      </Badge>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="text-sm">
                          <p className="text-gray-500">Montant</p>
                          <p className="font-medium">{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="text-sm">
                          <p className="text-gray-500">Durée</p>
                          <p className="font-medium">{plan.min_duration} - {plan.max_duration} mois</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="text-sm">
                          <p className="text-gray-500">Taux d'intérêt</p>
                          <p className="font-medium">{plan.interest_rate}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="text-sm">
                          <p className="text-gray-500">Frais</p>
                          <p className="font-medium">{plan.fees}%</p>
                        </div>
                      </div>
                    </div>
                    
                    {plan.requirements && plan.requirements.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Conditions requises:</p>
                        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                          {plan.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Modifier
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => plan.id && handleDelete(plan.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Supprimer
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="inactive">
          {loading ? (
            <div className="text-center py-8">Chargement des plans de prêt inactifs...</div>
          ) : loanPlans.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-gray-500">Aucun plan de prêt inactif</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Similar rendering as active plans but with inactive badge */}
              {loanPlans.map(plan => (
                <Card key={plan.id} className="overflow-hidden opacity-75">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700">
                        Inactif
                      </Badge>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  {/* Same content as active plans */}
                  <CardContent>
                    {/* Similar content as above */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="text-sm">
                          <p className="text-gray-500">Montant</p>
                          <p className="font-medium">{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="text-sm">
                          <p className="text-gray-500">Durée</p>
                          <p className="font-medium">{plan.min_duration} - {plan.max_duration} mois</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Percent className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="text-sm">
                          <p className="text-gray-500">Taux d'intérêt</p>
                          <p className="font-medium">{plan.interest_rate}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <div className="text-sm">
                          <p className="text-gray-500">Frais</p>
                          <p className="font-medium">{plan.fees}%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Modifier
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => plan.id && handleDelete(plan.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Supprimer
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Modifier le plan de prêt' : 'Créer un nouveau plan de prêt'}
            </DialogTitle>
            <DialogDescription>
              Définissez les caractéristiques du plan de prêt que vous souhaitez proposer à vos clients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du plan</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Prêt Agriculture"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="is_active">Statut</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="is_active" className="font-normal">
                    {formData.is_active ? 'Actif' : 'Inactif'}
                  </Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez brièvement ce plan de prêt"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">Montant minimum (FCFA)</Label>
                <Input
                  id="min_amount"
                  name="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={handleInputChange}
                  min="1000"
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
                  min={formData.min_amount}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_duration">Durée minimum (mois)</Label>
                <Input
                  id="min_duration"
                  name="min_duration"
                  type="number"
                  value={formData.min_duration}
                  onChange={handleInputChange}
                  min="1"
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
                  min={formData.min_duration}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
                <Input
                  id="interest_rate"
                  name="interest_rate"
                  type="number"
                  step="0.1"
                  value={formData.interest_rate}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fees">Frais (%)</Label>
                <Input
                  id="fees"
                  name="fees"
                  type="number"
                  step="0.1"
                  value={formData.fees}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Conditions requises (une par ligne)</Label>
              <Textarea
                id="requirements"
                value={requirementsText}
                onChange={handleRequirementsChange}
                placeholder="Ex: Pièce d'identité valide&#10;Justificatif de domicile&#10;Garantie"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button onClick={handleCreateOrUpdate}>
              {editingPlan ? 'Mettre à jour' : 'Créer le plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
