
import React from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle } from "lucide-react";
import SfdSelector from './SfdSelector';
import LoanPlansSelector from './LoanPlansSelector';
import { LoanPlan } from './types';
import { useLoanApplication, LoanFormValues } from './hooks/useLoanApplication';

interface LoanApplicationFormProps {
  form: ReturnType<typeof useLoanApplication>['form'];
  sfds: ReturnType<typeof useLoanApplication>['sfds'];
  selectedPlan: ReturnType<typeof useLoanApplication>['selectedPlan'];
  isLoading: boolean;
  onPlanSelect: (plan: LoanPlan) => void;
  onSubmit: (data: LoanFormValues) => Promise<void>;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  form,
  sfds,
  selectedPlan,
  isLoading,
  onPlanSelect,
  onSubmit
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="sfdId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sélectionner une SFD</FormLabel>
              <FormControl>
                <SfdSelector 
                  value={field.value}
                  onValueChange={field.onChange}
                  sfds={sfds}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.getValues().sfdId && (
          <>
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan de prêt</FormLabel>
                  <FormControl>
                    <div>
                      <input type="hidden" {...field} />
                      <LoanPlansSelector 
                        sfdId={form.getValues().sfdId}
                        onSelectPlan={onPlanSelect}
                        selectedPlanId={field.value}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedPlan && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant (FCFA)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            min={selectedPlan.min_amount}
                            max={selectedPlan.max_amount}
                          />
                        </FormControl>
                        <FormDescription>
                          Entre {selectedPlan.min_amount.toLocaleString('fr-FR')} et {selectedPlan.max_amount.toLocaleString('fr-FR')} FCFA
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée (mois)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            min={selectedPlan.min_duration}
                            max={selectedPlan.max_duration}
                          />
                        </FormControl>
                        <FormDescription>
                          Entre {selectedPlan.min_duration} et {selectedPlan.max_duration} mois
                        </FormDescription>
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
                      <FormLabel>Objet du prêt</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Par exemple: commerce, agriculture, construction, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description du projet</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          rows={4}
                          placeholder="Décrivez votre projet et comment vous comptez utiliser ce prêt..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </>
        )}
        
        <Button 
          type="submit" 
          className="w-full py-4 text-lg font-semibold bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white shadow-lg"
          disabled={isLoading || !selectedPlan}
        >
          {isLoading && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
          Soumettre ma demande
        </Button>
      </form>
    </Form>
  );
};

export default LoanApplicationForm;
