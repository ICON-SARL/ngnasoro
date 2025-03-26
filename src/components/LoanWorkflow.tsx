
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { 
  FileText, 
  Plus, 
  Settings, 
  Calendar, 
  Percent, 
  ClipboardList,
  User,
  CheckSquare,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const LoanWorkflow = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const form = useForm({
    defaultValues: {
      minAmount: 50000,
      maxAmount: 5000000,
      minDuration: 3,
      maxDuration: 36,
      baseRate: 5.5,
    }
  });

  const loanRequests = [
    {
      id: 'LR001',
      client: 'Ibrahim Traoré',
      amount: '250,000 FCFA',
      duration: '12 mois',
      purpose: 'Financement de commerce',
      status: 'pending',
      submittedDate: '21/04/2023',
    },
    {
      id: 'LR002',
      client: 'Aminata Diallo',
      amount: '500,000 FCFA',
      duration: '24 mois',
      purpose: 'Achat matériel agricole',
      status: 'approved',
      submittedDate: '20/04/2023',
    },
    {
      id: 'LR003',
      client: 'Moussa Coulibaly',
      amount: '150,000 FCFA',
      duration: '6 mois',
      purpose: 'Fonds de roulement',
      status: 'pending',
      submittedDate: '19/04/2023',
    },
    {
      id: 'LR004',
      client: 'Fatou Koné',
      amount: '1,200,000 FCFA',
      duration: '36 mois',
      purpose: 'Construction',
      status: 'rejected',
      submittedDate: '18/04/2023',
      rejectionReason: 'Revenu insuffisant',
    },
  ];

  const onSubmit = (data: any) => {
    console.log('Loan configuration updated:', data);
    setIsConfiguring(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Workflow de Prêt</h2>
          <p className="text-sm text-muted-foreground">
            Configuration et gestion du cycle de prêt
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsConfiguring(!isConfiguring)}>
            <Settings className="h-4 w-4 mr-1" />
            Configurer
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau Prêt
          </Button>
        </div>
      </div>
      
      {isConfiguring && (
        <div className="mb-6 border rounded-lg p-6 bg-muted/10">
          <h3 className="text-lg font-medium mb-4">Configuration du Workflow de Prêt</h3>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Montants</h4>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="minAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant minimum (FCFA)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Montant maximum (FCFA)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Durées</h4>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="minDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée minimum (mois)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée maximum (mois)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Taux d'intérêt</h4>
                <FormField
                  control={form.control}
                  name="baseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux de base (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Le taux de base peut être ajusté en fonction du profil de risque du client
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-2 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsConfiguring(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer la Configuration
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
      
      <Tabs defaultValue="requests" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="requests">
            <ClipboardList className="h-4 w-4 mr-2" />
            Demandes de prêt
          </TabsTrigger>
          <TabsTrigger value="active">
            <CheckSquare className="h-4 w-4 mr-2" />
            Prêts actifs
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="border rounded-lg">
          <table className="min-w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Montant</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Durée</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Objet</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loanRequests.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-4 py-3 text-sm font-medium">{loan.id}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51] mr-2">
                        <User className="h-4 w-4" />
                      </div>
                      {loan.client}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{loan.amount}</td>
                  <td className="px-4 py-3 text-sm">{loan.duration}</td>
                  <td className="px-4 py-3 text-sm">{loan.purpose}</td>
                  <td className="px-4 py-3 text-sm">
                    {loan.status === 'pending' && (
                      <Badge className="bg-amber-100 text-amber-800">En attente</Badge>
                    )}
                    {loan.status === 'approved' && (
                      <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
                    )}
                    {loan.status === 'rejected' && (
                      <Badge className="bg-red-100 text-red-800">Rejeté</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>
        
        <TabsContent value="active">
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Prêts actifs</h3>
            <p className="mt-2 text-muted-foreground">
              Affichage des prêts en cours, échéances et statuts de remboursement
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Historique des prêts</h3>
            <p className="mt-2 text-muted-foreground">
              Historique complet des prêts terminés et archivés
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-[#0D6A51] mr-2" />
            <h3 className="font-medium">Durées courantes</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Court terme (3-6 mois)</span>
              <span className="font-medium">30%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Moyen terme (12-24 mois)</span>
              <span className="font-medium">55%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Long terme (36+ mois)</span>
              <span className="font-medium">15%</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Percent className="h-5 w-5 text-[#0D6A51] mr-2" />
            <h3 className="font-medium">Taux d'intérêt</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taux minimum</span>
              <span className="font-medium">4.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taux standard</span>
              <span className="font-medium">5.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taux maximum</span>
              <span className="font-medium">8.0%</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FileText className="h-5 w-5 text-[#0D6A51] mr-2" />
            <h3 className="font-medium">Statistiques prêts</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Taux d'approbation</span>
              <span className="font-medium">78%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taux de remboursement</span>
              <span className="font-medium">92%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Durée moyenne</span>
              <span className="font-medium">18 mois</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
