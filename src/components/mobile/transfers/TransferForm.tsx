
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

const transferFormSchema = z.object({
  amount: z.number({
    required_error: "Le montant est requis.",
  }).min(1, "Le montant doit être supérieur à 0."),
  fromAccountId: z.string({
    required_error: "Le compte source est requis.",
  }),
  toAccountId: z.string({
    required_error: "Le compte de destination est requis.",
  }),
});

interface TransferFormValues extends z.infer<typeof transferFormSchema> {}

export function TransferForm() {
  const { accounts, transferFunds } = useSfdAccounts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isTransferring, setIsTransferring] = useState(false);

  // Safely format account name/description
  const getAccountName = (account: any) => {
    return account?.name || account?.description || `Compte ${account?.account_type || ''}`;
  };

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      amount: 0,
      fromAccountId: "",
      toAccountId: "",
    },
  });

  async function onSubmit(values: TransferFormValues) {
    setIsTransferring(true);
    try {
      await transferFunds.mutate({
        sfdId: accounts[0]?.sfd_id || '', // Assuming all accounts belong to same SFD
        fromAccountId: values.fromAccountId,
        toAccountId: values.toAccountId,
        amount: values.amount,
        description: `Transfert de fonds`
      });
      toast({
        title: "Transfert réussi!",
        description: "Votre transfert a été effectué avec succès.",
      });
      navigate('/mobile-flow/funds');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur!",
        description: error.message || "Une erreur est survenue lors du transfert.",
      });
    } finally {
      setIsTransferring(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fromAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compte source</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountName(account)} ({formatCurrency(account.balance)})
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
          name="toAccountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compte de destination</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte de destination" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountName(account)} ({formatCurrency(account.balance)})
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
              <FormLabel>Montant</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Montant à transférer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isTransferring} type="submit" className="w-full">
          {isTransferring ? "Transfert en cours..." : "Effectuer le transfert"}
        </Button>
      </form>
    </Form>
  );
}
