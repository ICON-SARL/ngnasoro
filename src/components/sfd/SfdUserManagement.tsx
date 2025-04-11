import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { User, Mail, Shield, Plus, Search, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useSfdUserManagement, SfdUser, UserFormValues } from '@/hooks/useSfdUserManagement';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';

const userFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  email: z.string().email({ message: 'Email invalide' }),
  role: z.string().min(1, { message: 'Le rôle est requis' }),
  password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),
  sendNotification: z.boolean().default(true)
});

type UserFormSchemaValues = z.infer<typeof userFormSchema>;

export function SfdUserManagement() {
  const {
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    addSfdUser,
    deleteSfdUser,
    refreshUsers
  } = useSfdUserManagement();
  
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SfdUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const roles = ['Gérant', 'Agent de Crédit', 'Caissier', 'Agent de Terrain'];

  const form = useForm<UserFormSchemaValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      password: '',
      sendNotification: true
    }
  });

  const handleAddUser = async (values: UserFormSchemaValues) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const userData: UserFormValues = {
        name: values.name,
        email: values.email,
        role: values.role,
        password: values.password,
        sendNotification: values.sendNotification
      };
      
      const success = await addSfdUser(userData);
      if (success) {
        setShowNewUserDialog(false);
        form.reset();
      }
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteSfdUser(userToDelete.id);
      if (success) {
        setUserToDelete(null);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'Gérant':
        return 'bg-blue-50 text-blue-700';
      case 'Agent de Crédit':
        return 'bg-green-50 text-green-700';
      case 'Caissier':
        return 'bg-amber-50 text-amber-600';
      case 'Agent de Terrain':
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gestion des utilisateurs SFD</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les comptes utilisateurs de votre SFD
          </p>
        </div>
        
        <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Créez un nouveau compte utilisateur avec des permissions spécifiques.
              </DialogDescription>
            </DialogHeader>
            
            {formError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nom complet" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="email@example.com" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="••••••••" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sendNotification"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 pt-2">
                      <div className="space-y-0.5">
                        <FormLabel>Envoyer une notification</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Envoyer un email d'invitation
                        </p>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewUserDialog(false)}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : 'Ajouter'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted/40">
          <div className="relative">
            <Label htmlFor="search-user" className="sr-only">Rechercher</Label>
            <Input
              id="search-user"
              placeholder="Rechercher par nom ou email..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? "Aucun utilisateur ne correspond à votre recherche" : "Aucun utilisateur trouvé"}
          </div>
        ) : (
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/20">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">{user.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end mr-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getRoleBadgeClass(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      Dernière activité: {user.lastActive || 'Jamais'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setUserToDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {userToDelete?.name} ? Cette action est définitive et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
