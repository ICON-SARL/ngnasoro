
import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { useAdminCommunication, AdminNotificationRequest } from '@/hooks/useAdminCommunication';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type SfdAdmin = {
  id: string;
  full_name: string;
  email: string;
  sfd_id: string;
  sfd_name: string;
};

export function MerefSfdCommunication() {
  const { user, isAdmin } = useAuth();
  const { sendNotification } = useAdminCommunication();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState<SfdAdmin[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('all'); // Initialize with 'all' instead of empty string
  const [notification, setNotification] = useState<AdminNotificationRequest>({
    title: '',
    message: '',
    type: 'info'
  });

  // Fetch SFD admins when the dialog is opened
  const fetchSfdAdmins = async () => {
    setIsLoadingRecipients(true);
    try {
      // Get SFD admins
      const { data: admins, error } = await supabase
        .from('admin_users')
        .select('id, full_name, email')
        .eq('role', 'sfd_admin');
        
      if (error) throw error;
      
      // Get SFD details for each admin
      if (admins) {
        const adminWithSfds = await Promise.all(
          admins.map(async (admin) => {
            const { data: userSfds, error: sfdsError } = await supabase
              .from('user_sfds')
              .select('sfd_id')
              .eq('user_id', admin.id)
              .single();
              
            if (sfdsError) return { ...admin, sfd_id: '', sfd_name: 'SFD Inconnue' };
            
            if (userSfds) {
              const { data: sfdData, error: sfdError } = await supabase
                .from('sfds')
                .select('name')
                .eq('id', userSfds.sfd_id)
                .single();
                
              if (sfdError || !sfdData) return { ...admin, sfd_id: userSfds.sfd_id, sfd_name: 'SFD Inconnue' };
              
              return { ...admin, sfd_id: userSfds.sfd_id, sfd_name: sfdData.name };
            }
            
            return { ...admin, sfd_id: '', sfd_name: 'SFD Inconnue' };
          })
        );
        
        setRecipients(adminWithSfds as SfdAdmin[]);
      }
    } catch (error) {
      console.error('Error fetching SFD admins:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des administrateurs SFD",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchSfdAdmins();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!notification.title.trim() || !notification.message.trim()) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }
      
      const notificationToSend: AdminNotificationRequest = {
        ...notification,
        recipient_id: selectedRecipientId === 'all' ? undefined : selectedRecipientId, // Changed logic to match new default
        recipient_role: selectedRecipientId === 'all' ? 'sfd_admin' : undefined
      };
      
      const result = await sendNotification(notificationToSend);
      
      if (!result.success) {
        throw new Error('Échec de l\'envoi de la notification');
      }
      
      toast({
        title: "Succès",
        description: selectedRecipientId !== 'all'
          ? "Message envoyé à l'administrateur SFD sélectionné" 
          : "Message envoyé à tous les administrateurs SFD"
      });
      
      setNotification({
        title: '',
        message: '',
        type: 'info'
      });
      setSelectedRecipientId('all');
      setOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for MEREF admins
  if (!isAdmin) return null;

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center" 
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Communiquer avec les SFD
      </Button>
      
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Contacter les Administrateurs SFD</DialogTitle>
              <DialogDescription>
                Envoyez un message aux administrateurs des SFD. Ce message apparaîtra dans leurs notifications.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipient" className="text-right">
                  Destinataire
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={selectedRecipientId} 
                    onValueChange={setSelectedRecipientId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les administrateurs SFD" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Tous les administrateurs SFD</SelectItem>
                        <SelectLabel>Administrateurs spécifiques</SelectLabel>
                        {isLoadingRecipients ? (
                          <SelectItem value="loading" disabled>
                            Chargement...
                          </SelectItem>
                        ) : recipients.length > 0 ? (
                          recipients.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.full_name} ({admin.sfd_name})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_admins" disabled>
                            Aucun administrateur trouvé
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={notification.type} 
                    onValueChange={(val: any) => setNotification({ ...notification, type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="warning">Avertissement</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                      <SelectItem value="action_required">Action requise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Titre
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  value={notification.title}
                  onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                  placeholder="Titre du message"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">
                  Lien (optionnel)
                </Label>
                <Input
                  id="link"
                  className="col-span-3"
                  value={notification.action_link || ''}
                  onChange={(e) => setNotification({ ...notification, action_link: e.target.value })}
                  placeholder="/credit-approval"
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="message" className="text-right pt-2">
                  Message
                </Label>
                <Textarea
                  id="message"
                  className="col-span-3"
                  value={notification.message}
                  onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                  placeholder="Contenu de votre message"
                  rows={5}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Envoi...' : 'Envoyer le message'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
