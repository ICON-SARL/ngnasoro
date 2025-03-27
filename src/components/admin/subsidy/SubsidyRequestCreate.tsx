
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/apiClient';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';

interface SubsidyRequestCreateProps {
  onSuccess?: () => void;
}

export function SubsidyRequestCreate({ onSuccess }: SubsidyRequestCreateProps) {
  const { createSubsidyRequest } = useSubsidyRequests();
  
  // Fetch SFDs for the dropdown
  const { data: sfds = [], isLoading: isLoadingSfds } = useQuery({
    queryKey: ['sfds'],
    queryFn: apiClient.getSfdsList
  });
  
  const form = useForm({
    defaultValues: {
      sfdId: '',
      amount: '',
      purpose: '',
      justification: '',
      priority: 'normal',
      region: '',
      expectedImpact: ''
    }
  });
  
  const onSubmit = async (data: any) => {
    try {
      await createSubsidyRequest.mutateAsync({
        sfd_id: data.sfdId,
        amount: parseFloat(data.amount),
        purpose: data.purpose,
        justification: data.justification,
        priority: data.priority,
        region: data.region,
        expected_impact: data.expectedImpact
      });
      
      // Reset form
      form.reset();
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating subsidy request:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer une nouvelle demande de subvention</CardTitle>
        <CardDescription>
          Soumettez une nouvelle demande de subvention pour une SFD
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sfdId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution SFD</FormLabel>
                    <Select
                      disabled={isLoadingSfds}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une SFD" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sfds.map((sfd) => (
                          <SelectItem key={sfd.id} value={sfd.id}>
                            {sfd.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (FCFA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 5000000" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet de la demande</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Financement des prêts agricoles" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Région</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dakar">Dakar</SelectItem>
                        <SelectItem value="Thiès">Thiès</SelectItem>
                        <SelectItem value="Diourbel">Diourbel</SelectItem>
                        <SelectItem value="Fatick">Fatick</SelectItem>
                        <SelectItem value="Kaolack">Kaolack</SelectItem>
                        <SelectItem value="Kaffrine">Kaffrine</SelectItem>
                        <SelectItem value="Kédougou">Kédougou</SelectItem>
                        <SelectItem value="Kolda">Kolda</SelectItem>
                        <SelectItem value="Louga">Louga</SelectItem>
                        <SelectItem value="Matam">Matam</SelectItem>
                        <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
                        <SelectItem value="Sédhiou">Sédhiou</SelectItem>
                        <SelectItem value="Tambacounda">Tambacounda</SelectItem>
                        <SelectItem value="Ziguinchor">Ziguinchor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner la priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="normal">Normale</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Justification détaillée de la demande de subvention..." 
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expectedImpact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impact attendu</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Décrivez l'impact attendu de cette subvention..." 
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="submit"
              disabled={createSubsidyRequest.isPending}
            >
              {createSubsidyRequest.isPending ? 'Création...' : 'Créer la demande'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
