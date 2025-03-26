
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar as CalendarIcon, Check, HelpCircle, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export const RepaymentRescheduling = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rescheduled, setRescheduled] = useState(false);
  
  const form = useForm({
    defaultValues: {
      loanId: 'LN-2023-04587',
      borrowerName: 'Koné Ibrahim',
      originalDate: new Date('2023-05-15'),
      newDate: undefined,
      reason: '',
      notificationMethod: 'sms'
    }
  });
  
  const onSubmit = (data) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRescheduled(true);
      toast({
        title: "Échéance reprogrammée",
        description: `L'échéance a été reprogrammée au ${format(data.newDate, 'dd/MM/yyyy')}.`,
      });
    }, 2000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="mr-2 h-5 w-5 text-[#0D6A51]" />
          Reprogrammation Intelligente des Échéances
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!rescheduled ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="loanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identifiant du prêt</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="borrowerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'emprunteur</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="originalDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'échéance actuelle</FormLabel>
                        <FormControl>
                          <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            {format(field.value, 'dd/MM/yyyy')}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Nouvelle date d'échéance</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, 'dd/MM/yyyy') : <span>Sélectionnez une date</span>}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motif de la reprogrammation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un motif" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash-flow">Problème de trésorerie temporaire</SelectItem>
                            <SelectItem value="medical">Dépense médicale imprévue</SelectItem>
                            <SelectItem value="revenue-delay">Retard de paiement client</SelectItem>
                            <SelectItem value="natural-disaster">Catastrophe naturelle</SelectItem>
                            <SelectItem value="other">Autre motif</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Le motif sera enregistré dans l'historique du prêt.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notificationMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Méthode de notification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une méthode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="both">SMS + Email</SelectItem>
                            <SelectItem value="call">Appel téléphonique</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mt-6">
                    <div className="flex items-start space-x-2">
                      <HelpCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Conseils de l'algorithme d'ajustement</p>
                        <p className="text-xs text-amber-700 mt-1">
                          L'analyse du profil client suggère que le {format(new Date('2023-05-25'), 'dd/MM/yyyy')} 
                          serait une date optimale pour le report (10 jours après la date initiale). 
                          Cette recommandation est basée sur l'historique de paiement et le flux de trésorerie estimé du client.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Traitement en cours..." : "Reprogrammer l'échéance"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Reprogrammation réussie !</h3>
              <p className="text-muted-foreground mb-4">L'échéance a été reprogrammée et le client a été notifié.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-3">Détails de la reprogrammation</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Prêt référence:</span>
                    <span>LN-2023-04587</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Client:</span>
                    <span>Koné Ibrahim</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Date initiale:</span>
                    <span>{format(new Date('2023-05-15'), 'dd/MM/yyyy')}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Nouvelle date:</span>
                    <span className="font-medium">{format(new Date('2023-05-25'), 'dd/MM/yyyy')}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Frais de report:</span>
                    <span>2,500 FCFA</span>
                  </p>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-3">Impact sur le prêt</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Score de crédit</p>
                    <div className="flex items-center">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="ml-2 font-medium">85/100</span>
                    </div>
                    <p className="text-xs text-amber-600 mt-1 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Impact minimal (-2 points)
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <Badge className="bg-blue-100 text-blue-800">Notification SMS envoyée</Badge>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-muted-foreground mb-1">Prochaine vérification de solvabilité</p>
                    <p>{format(new Date('2023-06-15'), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setRescheduled(false)}>
                Retour à la gestion des échéances
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
