import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';
import { useSfdAdminManagement } from '../hooks/sfd-admin/useSfdAdminManagement';

const formSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

export const MerefSfdCommunication = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { sfdAdmins } = useSfdAdminManagement();
  const { sendNotification } = useAdminCommunication();
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    recipient_id: '',
    recipient_role: 'sfd_admin'
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const notificationToSend = {
        ...notification,
        title: values.title,
        message: values.message,
        recipient_role: 'sfd_admin'
      };

      const result = await sendNotification(notificationToSend);
      
      if (result.success) {
        toast.success('Message envoyé aux administrateurs SFD');
        setIsOpen(false);
        form.reset();
      } else {
        toast.error(`Erreur lors de l'envoi du message: ${result.error}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center bg-white border-gray-200 hover:bg-gray-50 hover:text-green-600 text-sm"
        >
          <MessageSquare className="h-4 w-4 mr-2 text-gray-600" />
          Communiquer avec SFDs
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Communiquer avec les SFDs</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du message</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le titre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Composez votre message pour les administrateurs SFD" 
                      className="resize-y min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsOpen(false);
                  form.reset();
                  setNotification({
                    title: '',
                    message: '',
                    type: 'info',
                    recipient_id: '',
                    recipient_role: 'sfd_admin',
                  });
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
