
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useTransfer } from '@/hooks/useTransfer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { Calendar as CalendarIcon, Clock, Send, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAccount } from '@/hooks/useAccount';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

// Schéma de validation pour le formulaire de transfert
const transferSchema = z.object({
  recipientType: z.enum(['account', 'phone']),
  recipientId: z.string().optional(),
  phoneNumber: z.string().optional(),
  recipientName: z.string().optional(),
  amount: z.coerce.number().positive({ message: 'Le montant doit être positif' }),
  transferType: z.enum(['immediate', 'scheduled']),
  scheduledDate: z.date().optional(),
  description: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

export function TransferForm() {
  const { user } = useAuth();
  const { account } = useAccount();
  const { accounts } = useSfdAccounts();
  const { transferFunds, recentContacts, isLoadingContacts } = useTransfer();
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  
  // Initialiser le formulaire
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipientType: 'phone',
      amount: 0,
      transferType: 'immediate',
    },
  });
  
  // Récupérer les valeurs du formulaire
  const watchRecipientType = form.watch('recipientType');
  const watchTransferType = form.watch('transferType');
  
  // Gérer la sélection d'un contact
  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    if (contact.phone) {
      form.setValue('phoneNumber', contact.phone);
      form.setValue('recipientType', 'phone');
    }
    form.setValue('recipientName', contact.name);
  };
  
  // Soumettre le formulaire
  const onSubmit = async (values: TransferFormValues) => {
    if (!user || !account) return;
    
    try {
      // Préparer les paramètres du transfert
      const transferParams = {
        fromAccountId: account.id,
        amount: values.amount,
        description: values.description,
        transferType: values.recipientType === 'account' ? 'internal' as const : 'mobile_money' as const,
        recipientName: values.recipientName,
        scheduledDate: values.transferType === 'scheduled' ? values.scheduledDate : undefined,
      };
      
      // Ajouter les paramètres spécifiques au type de destinataire
      if (values.recipientType === 'account' && values.recipientId) {
        Object.assign(transferParams, { toAccountId: values.recipientId });
      } else if (values.recipientType === 'phone' && values.phoneNumber) {
        Object.assign(transferParams, { recipientPhone: values.phoneNumber });
      }
      
      // Exécuter le transfert
      await transferFunds.mutateAsync(transferParams);
      
      // Réinitialiser le formulaire après un transfert réussi
      form.reset();
      setSelectedContact(null);
      
    } catch (error) {
      console.error("Erreur lors du transfert:", error);
    }
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="transfer" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="transfer">Transfert</TabsTrigger>
          <TabsTrigger value="contacts">Contacts récents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transfer" className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Type de destinataire */}
              <FormField
                control={form.control}
                name="recipientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de destinataire</FormLabel>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex justify-start space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <label htmlFor="phone">Numéro de téléphone</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="account" id="account" />
                        <label htmlFor="account">Compte SFD</label>
                      </div>
                    </RadioGroup>
                  </FormItem>
                )}
              />
              
              {/* Destinataire - Téléphone */}
              {watchRecipientType === 'phone' && (
                <>
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Exemple: 01234567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du destinataire (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nom du destinataire"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {/* Destinataire - Compte */}
              {watchRecipientType === 'account' && (
                <FormField
                  control={form.control}
                  name="recipientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compte destinataire</FormLabel>
                      <select
                        className="w-full p-2 border rounded-md"
                        {...field}
                      >
                        <option value="">Sélectionner un compte</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.description || `Compte ${account.account_type}`} - Balance: {account.balance} FCFA
                          </option>
                        ))}
                      </select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Montant */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Type de transfert */}
              <FormField
                control={form.control}
                name="transferType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quand effectuer le transfert?</FormLabel>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex justify-start space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="immediate" id="immediate" />
                        <label htmlFor="immediate">Immédiatement</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="scheduled" id="scheduled" />
                        <label htmlFor="scheduled">Programmer</label>
                      </div>
                    </RadioGroup>
                  </FormItem>
                )}
              />
              
              {/* Date programmée */}
              {watchTransferType === 'scheduled' && (
                <FormField
                  control={form.control}
                  name="scheduledDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date du transfert</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal flex justify-between"
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: fr })
                              ) : (
                                <span>Choisir une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Motif du transfert"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Solde du compte */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Votre solde:</span>
                  <span className="font-medium text-lg">{account?.balance.toLocaleString()} FCFA</span>
                </div>
              </div>
              
              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full"
                disabled={transferFunds.isPending}
              >
                {transferFunds.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement en cours...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    {watchTransferType === 'immediate' ? 'Envoyer maintenant' : 'Programmer le transfert'}
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="contacts" className="pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contacts récents</h3>
            
            {isLoadingContacts ? (
              <div className="py-10 text-center">
                <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : recentContacts.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p>Vous n'avez pas encore de contacts récents</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {recentContacts.map((contact, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer ${selectedContact === contact ? 'border-blue-500 bg-blue-50' : ''}`}
                    onClick={() => handleContactSelect(contact)}
                  >
                    <CardContent className="flex items-center p-3">
                      <Avatar className="h-10 w-10 mr-3">
                        <img 
                          src={contact.avatar_url || '/lovable-uploads/64d80661-a6eb-404d-af95-8d0ffeaa0a34.png'} 
                          alt={contact.name} 
                        />
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        {contact.phone && (
                          <p className="text-sm text-gray-500">{contact.phone}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
