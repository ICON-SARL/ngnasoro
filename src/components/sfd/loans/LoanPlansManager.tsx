
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileEdit, Trash2, Plus, Percent, Calendar, CreditCard, Check, PieChart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
  created_at: string;
  total_allocated?: number;
  used_amount?: number;
  remaining_amount?: number;
}

const LoanPlansManager = () => {
  const { toast } = useToast();
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LoanPlan | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      min_amount: 10000,
      max_amount: 500000,
      min_duration: 1,
      max_duration: 24,
      interest_rate: 5.0,
      fees: 1.0,
      is_active: true,
      requirements: '',
      total_allocated: 0,
    }
  });

  useEffect(() => {
    fetchLoanPlans();
  }, [activeTab]);

  const fetchLoanPlans = async () => {
    setIsLoading(true);
    try {
      const { data: sfdData, error: sfdError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('is_default', true)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      if (sfdError) throw sfdError;

      const sfdId = sfdData.sfd_id;

      let query = supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', sfdId);

      if (activeTab === 'active') {
        query = query.eq('is_active', true);
      } else if (activeTab === 'inactive') {
        query = query.eq('is_active', false);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch loans for each plan to calculate used amounts
      const plansWithFunding = await Promise.all((data as LoanPlan[]).map(async (plan) => {
        // Get total allocated amount (this would come from a budget/allocation table in a real system)
        const totalAllocated = plan.max_amount * 10; // Example calculation - this would use actual allocation data
        
        // Get used amount from loans associated with this plan
        const { data: loansData, error: loansError } = await supabase
          .from('sfd_loans')
          .select('amount')
          .eq('sfd_id', sfdId);
          
        if (loansError) {
          console.error('Error fetching loans:', loansError);
          return {
            ...plan,
            total_allocated: totalAllocated,
            used_amount: 0,
            remaining_amount: totalAllocated
          };
        }
        
        const usedAmount = loansData ? loansData.reduce((sum, loan) => sum + loan.amount, 0) : 0;
        const remainingAmount = totalAllocated - usedAmount;
        
        return {
          ...plan,
          total_allocated: totalAllocated,
          used_amount: usedAmount,
          remaining_amount: remainingAmount
        };
      }));
      
      setLoanPlans(plansWithFunding);
    } catch (error: any) {
      console.error('Error fetching loan plans:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les plans de prêt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (plan: LoanPlan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      description: plan.description || '',
      min_amount: plan.min_amount,
      max_amount: plan.max_amount,
      min_duration: plan.min_duration,
      max_duration: plan.max_duration,
      interest_rate: plan.interest_rate,
      fees: plan.fees,
      is_active: plan.is_active,
      requirements: plan.requirements ? plan.requirements.join('\n') : '',
      total_allocated: plan.total_allocated || 0,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    form.reset({
      name: '',
      description: '',
      min_amount: 10000,
      max_amount: 500000,
      min_duration: 1,
      max_duration: 24,
      interest_rate: 5.0,
      fees: 1.0,
      is_active: true,
      requirements: '',
      total_allocated: 5000000, // Default allocation amount
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: any) => {
    try {
      const { data: sfdData, error: sfdError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('is_default', true)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();

      if (sfdError) throw sfdError;

      const requirementsArray = values.requirements
        ? values.requirements.split('\n').filter((req: string) => req.trim() !== '')
        : [];

      const planData = {
        name: values.name,
        description: values.description,
        min_amount: values.min_amount,
        max_amount: values.max_amount,
        min_duration: values.min_duration,
        max_duration: values.max_duration,
        interest_rate: values.interest_rate,
        fees: values.fees,
        is_active: values.is_active,
        requirements: requirementsArray,
        sfd_id: sfdData.sfd_id,
      };

      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Plan de prêt mis à jour",
        });
      } else {
        // Create new plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .insert(planData);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Nouveau plan de prêt créé",
        });
      }

      setDialogOpen(false);
      fetchLoanPlans();
    } catch (error: any) {
      console.error('Error saving loan plan:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'enregistrement du plan de prêt",
        variant: "destructive",
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
        title: "Statut mis à jour",
        description: `Plan ${plan.name} ${!plan.is_active ? 'activé' : 'désactivé'}`,
      });

      fetchLoanPlans();
    } catch (error: any) {
      console.error('Error toggling plan status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du plan",
        variant: "destructive",
      });
    }
  };

  const getFundingStatus = (plan: LoanPlan) => {
    const remainingAmount = plan.remaining_amount || 0;
    const totalAllocated = plan.total_allocated || 1; // Avoid division by zero
    const percentRemaining = (remainingAmount / totalAllocated) * 100;
    
    if (percentRemaining > 70) return { color: "bg-green-500", text: "Élevé" };
    if (percentRemaining > 30) return { color: "bg-amber-500", text: "Moyen" };
    return { color: "bg-red-500", text: "Faible" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Plans de Prêt SFD</h2>
          <p className="text-sm text-muted-foreground">
            Configurez et gérez les plans de prêt disponibles pour vos clients
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#0D6A51] hover:bg-[#0A5A44]">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Plan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white rounded-lg shadow-sm p-4">
        <TabsList className="mb-4 bg-gray-100 p-1 rounded-md">
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-[#0D6A51]">Tous les plans</TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-[#0D6A51]">Plans actifs</TabsTrigger>
          <TabsTrigger value="inactive" className="data-[state=active]:bg-white data-[state=active]:text-[#0D6A51]">Plans inactifs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderLoanPlans()}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {renderLoanPlans()}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {renderLoanPlans()}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Modifier' : 'Ajouter'} un plan de prêt</DialogTitle>
            <DialogDescription>
              Configurez les détails du plan de prêt à proposer aux clients
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du plan</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Microcrédit Entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Actif</FormLabel>
                        <FormDescription>
                          Rendre ce plan disponible aux clients
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description du plan de prêt"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_allocated"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant total alloué (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Budget total disponible pour ce type de prêt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="min_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant minimum (FCFA)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant maximum (FCFA)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="min_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée minimum (mois)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="max_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée maximum (mois)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interest_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux d'intérêt (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frais de dossier (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conditions requises</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Une condition par ligne"
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Entrez chaque condition sur une nouvelle ligne
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" className="bg-[#0D6A51] hover:bg-[#0A5A44]">
                  {editingPlan ? 'Mettre à jour' : 'Créer'} le plan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderLoanPlans() {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-4 border-t-[#0D6A51] border-r-transparent border-b-[#0D6A51] border-l-transparent animate-spin"></div>
            <p className="text-[#0D6A51] font-medium mt-3">Chargement des plans de prêt...</p>
          </div>
        </div>
      );
    }

    if (loanPlans.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-2">Aucun plan de prêt trouvé</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Commencez par créer votre premier plan de prêt pour vos clients
          </p>
          <Button onClick={handleAdd} className="bg-[#0D6A51] hover:bg-[#0A5A44]">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un plan
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loanPlans.map((plan) => {
          const fundingStatus = getFundingStatus(plan);
          const percentRemaining = ((plan.remaining_amount || 0) / (plan.total_allocated || 1)) * 100;
          
          return (
            <Card key={plan.id} className={`overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg ${!plan.is_active ? "opacity-70" : ""}`}>
              <CardHeader className="pb-2 bg-gray-50 border-b">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(plan)}
                    >
                      <FileEdit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => togglePlanStatus(plan)}
                    >
                      {plan.is_active ? (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      ) : (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </div>
                {!plan.is_active && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 mt-1">Inactif</Badge>
                )}
              </CardHeader>
              
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {plan.description || "Aucune description"}
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Budget restant</span>
                      <span className="font-semibold text-[#0D6A51]">
                        {new Intl.NumberFormat('fr-FR').format(plan.remaining_amount || 0)} FCFA
                      </span>
                    </div>
                    
                    <div className="h-2 relative overflow-hidden rounded-full bg-gray-100">
                      <div 
                        className={`h-full absolute left-0 top-0 ${fundingStatus.color}`}
                        style={{ width: `${percentRemaining}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Disponible: {Math.round(percentRemaining)}%
                      </span>
                      <span className="text-muted-foreground">
                        Total: {new Intl.NumberFormat('fr-FR').format(plan.total_allocated || 0)} FCFA
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-[#0D6A51] mr-2" />
                      <div className="text-sm">
                        <p className="text-gray-500">Montant</p>
                        <p className="font-medium">
                          {plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-[#0D6A51] mr-2" />
                      <div className="text-sm">
                        <p className="text-gray-500">Durée</p>
                        <p className="font-medium">
                          {plan.min_duration} - {plan.max_duration} mois
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-[#0D6A51] mr-2" />
                      <div className="text-sm">
                        <p className="text-gray-500">Taux d'intérêt</p>
                        <p className="font-medium">
                          {plan.interest_rate}% + {plan.fees}% frais
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className={`
                      ${fundingStatus.color === 'bg-green-500' ? 'bg-green-50 text-green-700' : 
                        fundingStatus.color === 'bg-amber-500' ? 'bg-amber-50 text-amber-700' : 
                        'bg-red-50 text-red-700'} 
                      border-0
                    `}>
                      {fundingStatus.text}
                    </Badge>
                  </div>
                  
                  {plan.requirements && plan.requirements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1 mt-2">Conditions requises:</p>
                      <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                        {plan.requirements.slice(0, 3).map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                        {plan.requirements.length > 3 && (
                          <li className="text-[#0D6A51] list-none font-medium">
                            + {plan.requirements.length - 3} autres conditions
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
};

export default LoanPlansManager;
