
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Edit, Trash2, BadgePercent, BadgeCheck, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

// Définir le schéma de validation pour le formulaire de plan de prêt
const loanPlanSchema = z.object({
  name: z.string().min(1, { message: "Le nom du plan est requis" }),
  description: z.string().min(1, { message: "La description est requise" }),
  min_amount: z.number().min(1000, { message: "Le montant minimum doit être d'au moins 1000 FCFA" }),
  max_amount: z.number().min(10000, { message: "Le montant maximum doit être d'au moins 10000 FCFA" }),
  min_duration: z.number().min(1, { message: "La durée minimum doit être d'au moins 1 mois" }),
  max_duration: z.number().min(2, { message: "La durée maximum doit être d'au moins 2 mois" }),
  interest_rate: z.number().min(0, { message: "Le taux d'intérêt doit être positif" }),
  fees: z.number().min(0, { message: "Les frais doivent être positifs" }),
  is_active: z.boolean().default(true),
  requirements: z.array(z.string()).default([])
});

type LoanPlanFormValues = z.infer<typeof loanPlanSchema>;

export function LoanPlanManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loanPlans, setLoanPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoanPlanFormValues>({
    resolver: zodResolver(loanPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      min_amount: 10000,
      max_amount: 500000,
      min_duration: 1,
      max_duration: 12,
      interest_rate: 5,
      fees: 1,
      is_active: true,
      requirements: []
    }
  });

  // Charger les plans de prêt
  const fetchLoanPlans = async () => {
    try {
      setLoading(true);
      
      // Obtenir le sfd_id de l'utilisateur
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user?.id)
        .eq('is_default', true)
        .single();
      
      if (sfdsError) throw sfdsError;
      
      const sfdId = userSfds?.sfd_id;
      
      // Récupérer les plans de prêt pour cette SFD
      const { data, error } = await supabase
        .from('sfd_loan_plans')
        .select('*')
        .eq('sfd_id', sfdId)
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

  useEffect(() => {
    if (user) {
      fetchLoanPlans();
    }
  }, [user]);

  const openCreateDialog = () => {
    form.reset({
      name: '',
      description: '',
      min_amount: 10000,
      max_amount: 500000,
      min_duration: 1,
      max_duration: 12,
      interest_rate: 5,
      fees: 1,
      is_active: true,
      requirements: []
    });
    setEditingPlan(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (plan) => {
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
      requirements: plan.requirements || []
    });
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    form.reset();
    setEditingPlan(null);
  };

  const onSubmit = async (values: LoanPlanFormValues) => {
    try {
      // Vérifier que max est supérieur à min
      if (values.max_amount <= values.min_amount) {
        toast({
          title: 'Erreur de validation',
          description: 'Le montant maximum doit être supérieur au montant minimum',
          variant: 'destructive',
        });
        return;
      }
      
      if (values.max_duration <= values.min_duration) {
        toast({
          title: 'Erreur de validation',
          description: 'La durée maximum doit être supérieure à la durée minimum',
          variant: 'destructive',
        });
        return;
      }
      
      // Obtenir le sfd_id de l'utilisateur
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user?.id)
        .eq('is_default', true)
        .single();
      
      if (sfdsError) throw sfdsError;
      
      const sfdId = userSfds?.sfd_id;
      
      if (editingPlan) {
        // Mise à jour d'un plan existant
        const { error } = await supabase
          .from('sfd_loan_plans')
          .update({
            name: values.name,
            description: values.description,
            min_amount: values.min_amount,
            max_amount: values.max_amount,
            min_duration: values.min_duration,
            max_duration: values.max_duration,
            interest_rate: values.interest_rate,
            fees: values.fees,
            is_active: values.is_active,
            requirements: values.requirements,
            updated_at: new Date()
          })
          .eq('id', editingPlan.id);
          
        if (error) throw error;
        
        toast({
          title: 'Plan mis à jour',
          description: 'Le plan de prêt a été mis à jour avec succès',
        });
      } else {
        // Création d'un nouveau plan
        const { error } = await supabase
          .from('sfd_loan_plans')
          .insert({
            sfd_id: sfdId,
            name: values.name,
            description: values.description,
            min_amount: values.min_amount,
            max_amount: values.max_amount,
            min_duration: values.min_duration,
            max_duration: values.max_duration,
            interest_rate: values.interest_rate,
            fees: values.fees,
            is_active: values.is_active,
            requirements: values.requirements
          });
          
        if (error) throw error;
        
        toast({
          title: 'Plan créé',
          description: 'Le nouveau plan de prêt a été créé avec succès',
        });
      }
      
      closeDialog();
      fetchLoanPlans();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du plan de prêt:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le plan de prêt',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (plan, newStatus) => {
    try {
      const { error } = await supabase
        .from('sfd_loan_plans')
        .update({ is_active: newStatus })
        .eq('id', plan.id);
        
      if (error) throw error;
      
      toast({
        title: newStatus ? 'Plan activé' : 'Plan désactivé',
        description: `Le plan ${plan.name} a été ${newStatus ? 'activé' : 'désactivé'} avec succès`,
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du plan',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (planId) => {
    try {
      setDeleting(true);
      
      const { error } = await supabase
        .from('sfd_loan_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      
      toast({
        title: 'Plan supprimé',
        description: 'Le plan de prêt a été supprimé avec succès',
      });
      
      fetchLoanPlans();
    } catch (error) {
      console.error('Erreur lors de la suppression du plan:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le plan de prêt',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Gérer les exigences (requirements)
  const [newRequirement, setNewRequirement] = useState('');
  
  const addRequirement = () => {
    if (newRequirement.trim()) {
      const currentRequirements = form.getValues('requirements') || [];
      form.setValue('requirements', [...currentRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };
  
  const removeRequirement = (index) => {
    const currentRequirements = form.getValues('requirements') || [];
    form.setValue('requirements', currentRequirements.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Plans de Prêt</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau Plan
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Plans Actifs</TabsTrigger>
          <TabsTrigger value="inactive">Plans Inactifs</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {loanPlans
                .filter(plan => plan.is_active)
                .map(plan => (
                  <Card key={plan.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </div>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(plan, false)}>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Montant</p>
                          <p>{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Durée</p>
                          <p>{plan.min_duration} - {plan.max_duration} mois</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taux d'intérêt</p>
                          <p>{plan.interest_rate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frais</p>
                          <p>{plan.fees}%</p>
                        </div>
                      </div>
                      
                      {plan.requirements && plan.requirements.length > 0 && (
                        <div className="mt-4">
                          <p className="text-muted-foreground text-sm mb-2">Exigences:</p>
                          <ul className="text-sm list-disc pl-5">
                            {plan.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              
              {loanPlans.filter(plan => plan.is_active).length === 0 && (
                <div className="col-span-2 text-center p-8 border rounded-lg bg-muted/20">
                  <BadgePercent className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucun plan de prêt actif trouvé</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={openCreateDialog}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Créer un plan
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {loanPlans
                .filter(plan => !plan.is_active)
                .map(plan => (
                  <Card key={plan.id} className="border-dashed opacity-70">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </div>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleToggleActive(plan, true)}>
                            <BadgeCheck className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)} disabled={deleting}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Montant</p>
                          <p>{plan.min_amount.toLocaleString()} - {plan.max_amount.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Durée</p>
                          <p>{plan.min_duration} - {plan.max_duration} mois</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Taux d'intérêt</p>
                          <p>{plan.interest_rate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frais</p>
                          <p>{plan.fees}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              
              {loanPlans.filter(plan => !plan.is_active).length === 0 && (
                <div className="col-span-2 text-center p-8 border rounded-lg bg-muted/20">
                  <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Aucun plan de prêt inactif trouvé</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de création/édition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Modifier le plan de prêt' : 'Créer un nouveau plan de prêt'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? 'Modifiez les détails du plan de prêt existant.'
                : 'Définissez les paramètres pour un nouveau plan de prêt.'}
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
                        <Input placeholder="Prêt agricole" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Actif</FormLabel>
                        <FormDescription>
                          Ce plan sera visible par les clients
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description détaillée du plan de prêt"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant minimum (FCFA)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
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
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="min_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée minimum (mois)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
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
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interest_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux d'intérêt (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
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
                      <FormLabel>Frais (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Exigences du prêt */}
                <div className="col-span-2">
                  <FormLabel>Exigences pour le prêt</FormLabel>
                  <div className="flex mt-2 mb-4">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Ex: Pièce d'identité valide"
                      className="flex-1 mr-2"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={addRequirement}
                    >
                      Ajouter
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {form.watch('requirements')?.map((req, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span>{req}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeRequirement(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Annuler
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Mettre à jour' : 'Créer le plan'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoanPlanManagement;
