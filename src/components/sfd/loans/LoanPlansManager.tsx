
import React, { useState } from 'react';
import { useLoanPlans } from '@/hooks/useLoanPlans';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgePlus, Edit, Trash2, Check, Clock, Users, Percent, CalendarRange, Banknote } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';

export function LoanPlansManager() {
  const { loanPlans, isLoading, createLoanPlan, updateLoanPlan, deleteLoanPlan } = useLoanPlans();
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  
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
      requirements: ['Pièce d\'identité', 'Justificatif de domicile']
    }
  });
  
  // Filter loan plans based on active tab
  const filteredPlans = loanPlans.filter(plan => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return plan.is_active;
    if (activeTab === 'inactive') return !plan.is_active;
    return true;
  });
  
  const handleCreatePlan = (data: any) => {
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "SFD non sélectionné",
        variant: "destructive"
      });
      return;
    }
    
    createLoanPlan.mutate({
      ...data,
      sfd_id: activeSfdId
    }, {
      onSuccess: () => {
        toast({
          title: "Plan de prêt créé",
          description: "Le plan de prêt a été créé avec succès"
        });
        setShowNewPlanDialog(false);
        form.reset();
      }
    });
  };
  
  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
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
    setShowNewPlanDialog(true);
  };
  
  const handleSubmit = (data: any) => {
    if (selectedPlan) {
      updateLoanPlan.mutate({
        id: selectedPlan.id,
        ...data
      }, {
        onSuccess: () => {
          toast({
            title: "Plan mis à jour",
            description: "Le plan de prêt a été mis à jour avec succès"
          });
          setShowNewPlanDialog(false);
          setSelectedPlan(null);
        }
      });
    } else {
      handleCreatePlan(data);
    }
  };
  
  const handleDeletePlan = (planId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce plan de prêt?")) {
      deleteLoanPlan.mutate({ planId }, {
        onSuccess: () => {
          toast({
            title: "Plan supprimé",
            description: "Le plan de prêt a été supprimé avec succès"
          });
        }
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Plans de Prêt</h2>
          <p className="text-sm text-muted-foreground">
            Définissez les différents plans de prêt disponibles pour vos clients
          </p>
        </div>
        <Button onClick={() => {
          setSelectedPlan(null);
          form.reset();
          setShowNewPlanDialog(true);
        }}>
          <BadgePlus className="h-4 w-4 mr-2" />
          Nouveau Plan
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous les plans</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="inactive">Inactifs</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <h3 className="font-medium">Aucun plan de prêt trouvé</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Commencez par créer un nouveau plan pour vos clients
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSelectedPlan(null);
              form.reset();
              setShowNewPlanDialog(true);
            }}
          >
            <BadgePlus className="h-4 w-4 mr-2" />
            Créer un plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map(plan => (
            <Card key={plan.id} className={!plan.is_active ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  {plan.is_active ? (
                    <Badge className="bg-green-100 text-green-800">Actif</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100">Inactif</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Banknote className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {plan.min_amount.toLocaleString()} à {plan.max_amount.toLocaleString()} FCFA
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <CalendarRange className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {plan.min_duration} à {plan.max_duration} mois
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Taux d'intérêt: {plan.interest_rate}% + Frais: {plan.fees}%
                    </span>
                  </div>
                  {plan.requirements && plan.requirements.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Documents requis:</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.requirements.map((req: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? 'Modifier le plan' : 'Créer un nouveau plan de prêt'}</DialogTitle>
            <DialogDescription>
              Définissez les paramètres du plan de prêt pour vos clients
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du plan</Label>
                  <Input id="name" {...form.register('name')} required />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    {...form.register('description')} 
                    placeholder="Description du plan de prêt"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Montants (FCFA)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <Label htmlFor="min_amount" className="text-xs">Minimum</Label>
                        <Input 
                          id="min_amount" 
                          type="number" 
                          {...form.register('min_amount', { valueAsNumber: true })} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_amount" className="text-xs">Maximum</Label>
                        <Input 
                          id="max_amount" 
                          type="number" 
                          {...form.register('max_amount', { valueAsNumber: true })} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>Durée (mois)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label htmlFor="min_duration" className="text-xs">Minimum</Label>
                      <Input 
                        id="min_duration" 
                        type="number" 
                        {...form.register('min_duration', { valueAsNumber: true })} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_duration" className="text-xs">Maximum</Label>
                      <Input 
                        id="max_duration" 
                        type="number" 
                        {...form.register('max_duration', { valueAsNumber: true })} 
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="interest_rate">Taux d'intérêt (%)</Label>
                  <Input 
                    id="interest_rate" 
                    type="number" 
                    step="0.1" 
                    {...form.register('interest_rate', { valueAsNumber: true })} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="fees">Frais de dossier (%)</Label>
                  <Input 
                    id="fees" 
                    type="number" 
                    step="0.1" 
                    {...form.register('fees', { valueAsNumber: true })} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Plan actif</Label>
                  <Switch 
                    id="is_active" 
                    checked={form.watch('is_active')} 
                    onCheckedChange={(checked) => form.setValue('is_active', checked)} 
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewPlanDialog(false)}
              >
                Annuler
              </Button>
              <Button type="submit">
                {selectedPlan ? 'Mettre à jour' : 'Créer le plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
