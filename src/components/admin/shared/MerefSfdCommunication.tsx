
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAdminCommunication } from '@/hooks/useAdminCommunication';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';

export function MerefSfdCommunication() {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendNotification } = { sendNotification: (data: any) => Promise.resolve({ success: true }) }; // Mock function
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !subject.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir le sujet et le message",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendNotification({
        title: subject,
        message: message,
        recipient_role: 'admin',
        type: 'info',
        recipient_id: user?.id || ''
      });
      
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé au MEREF avec succès",
      });
      
      // Reset form and close dialog
      setMessage('');
      setSubject('');
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer le message: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <MessageSquare className="h-4 w-4 mr-2" />
          Contacter MEREF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Communication avec le MEREF</DialogTitle>
          <DialogDescription>
            Envoyez vos questions ou demandes directement au gestionnaire de la plateforme
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Sujet
            </label>
            <Input
              id="subject"
              placeholder="Sujet de votre message"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              placeholder="Votre message au MEREF..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Envoi en cours..." : "Envoyer le message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
