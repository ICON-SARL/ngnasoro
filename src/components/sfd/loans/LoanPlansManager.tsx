
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileEdit, Trash2, Plus, Percent, Calendar, CreditCard, Check } from 'lucide-react';
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
      setLoanPlans(data as LoanPlan[]);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Plans de Prêt SFD</h2>
          <p className="text-sm text-muted-foreground">
            Configurez et gérez les plans de prêt disponibles pour vos clients
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Plan
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous les plans</TabsTrigger>
          <TabsTrigger value="active">Plans actifs</TabsTrigger>
          <TabsTrigger value="inactive">Plans inactifs</TabsTrigger>
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
                <Button type="submit">
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
      return <div className="text-center py-6">Chargement des plans de prêt...</div>;
    }

    if (loanPlans.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <h3 className="font-medium mb-2">Aucun plan de prêt trouvé</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Commencez par créer votre premier plan de prêt pour vos clients
          </p>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un plan
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loanPlans.map((plan) => (
          <Card key={plan.id} className={!plan.is_active ? "opacity-70" : ""}>
            <CardHeader className="pb-2">
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
                <span className="text-xs text-muted-foreground">Inactif</span>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {plan.description || "Aucune description"}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-[#0D6A51] mr-2" />
                  <div className="text-sm">
                    <p>Montant</p>
                    <p className="font-medium">
                      {plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-[#0D6A51] mr-2" />
                  <div className="text-sm">
                    <p>Durée</p>
                    <p className="font-medium">
                      {plan.min_duration} - {plan.max_duration} mois
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Percent className="h-4 w-4 text-[#0D6A51] mr-2" />
                  <div className="text-sm">
                    <p>Taux d'intérêt</p>
                    <p className="font-medium">
                      {plan.interest_rate}% + {plan.fees}% frais
                    </p>
                  </div>
                </div>
              </div>
              
              {plan.requirements && plan.requirements.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">Conditions requises:</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    {plan.requirements.slice(0, 3).map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                    {plan.requirements.length > 3 && (
                      <li className="text-[#0D6A51]">
                        + {plan.requirements.length - 3} autres conditions
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default LoanPlansManager;
