
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { useAddSfdAdmin } from '../hooks/sfd-admin/useAddSfdAdmin';
import { generateSecurePassword } from '@/utils/security';

interface AddSfdAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sfdId: string;
  sfdName: string;
  onAddAdmin: (data: any) => void;
  isLoading: boolean;
  error: string | null;
}

export function AddSfdAdminDialog({
  isOpen,
  onOpenChange,
  sfdId,
  sfdName,
  onAddAdmin,
  isLoading,
  error
}: AddSfdAdminDialogProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [sendNotification, setSendNotification] = useState(true);
  const [formErrors, setFormErrors] = useState<{email?: string; fullName?: string; password?: string}>({});
  
  const handleSubmit = async () => {
    // Form validation
    const errors: {email?: string; fullName?: string; password?: string} = {};
    
    if (!email) {
      errors.email = "L'email est requis";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Format d'email invalide";
    }
    
    if (!fullName) {
      errors.fullName = "Le nom complet est requis";
    }
    
    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    
    // Submit form
    await onAddAdmin({
      email,
      password,
      full_name: fullName,
      role: 'sfd_admin',
      sfd_id: sfdId,
      notify: sendNotification
    });
    
    // Reset form
    setEmail('');
    setFullName('');
    setPassword('');
    setSendNotification(true);
  };
  
  const generatePassword = () => {
    const newPassword = generateSecurePassword();
    setPassword(newPassword);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un administrateur
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créez un compte administrateur pour {sfdName}. L'administrateur aura accès au tableau de bord SFD.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jean Dupont"
            />
            {formErrors.fullName && (
              <p className="text-red-500 text-xs">{formErrors.fullName}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@sfd.ml"
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs">{formErrors.email}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Mot de passe</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={generatePassword}
              >
                Générer
              </Button>
            </div>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {formErrors.password && (
              <p className="text-red-500 text-xs">{formErrors.password}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="notify"
              checked={sendNotification}
              onCheckedChange={setSendNotification}
            />
            <Label htmlFor="notify">Envoyer une notification</Label>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 p-2 rounded-md flex items-center text-red-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              'Créer le compte'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
