
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface AddSfdAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfdId: string;
  sfdName: string;
  onAddAdmin: (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify: boolean;
  }) => void;
  isLoading: boolean;
  error: string | null;
}

export function AddSfdAdminDialog({
  open,
  onOpenChange,
  sfdId,
  sfdName,
  onAddAdmin,
  isLoading,
  error
}: AddSfdAdminDialogProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [notifyUser, setNotifyUser] = useState(true);

  const onSubmit = (data: any) => {
    const adminData = {
      email: data.email,
      password: data.password,
      full_name: data.fullName,
      role: 'sfd_admin',
      sfd_id: sfdId,
      notify: notifyUser
    };
    onAddAdmin(adminData);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) reset();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créez un compte administrateur pour la SFD {sfdName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              placeholder="Prénom et nom"
              {...register("fullName", { required: "Le nom est requis" })}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs italic">
                {errors.fullName.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="email@example.com"
              type="email"
              {...register("email", { 
                required: "L'email est requis",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Format d'email invalide"
                }
              })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", { 
                required: "Le mot de passe est requis",
                minLength: {
                  value: 8,
                  message: "Le mot de passe doit contenir au moins 8 caractères"
                }
              })}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic">
                {errors.password.message as string}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="notify" 
              checked={notifyUser}
              onCheckedChange={(checked) => setNotifyUser(checked as boolean)}
            />
            <Label htmlFor="notify" className="text-sm">
              Envoyer un email d'invitation à l'utilisateur
            </Label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : 'Ajouter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
