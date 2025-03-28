
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Plus, 
  UserCog, 
  ShieldCheck, 
  Users, 
  Check, 
  Mail,
  Loader2 
} from 'lucide-react';
import { UserRole } from '@/hooks/auth/types';
import { assignRoleToUser } from './utils/roleUtils';

interface AddRoleDialogProps {
  onRoleAssigned: () => void;
}

export function AddRoleDialog({ onRoleAssigned }: AddRoleDialogProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [assigningRole, setAssigningRole] = useState(false);

  const handleAssignRole = async () => {
    setAssigningRole(true);
    try {
      const success = await assignRoleToUser(email, selectedRole);
      if (success) {
        setShowAddDialog(false);
        setEmail('');
        setSelectedRole('user');
        onRoleAssigned();
      }
    } finally {
      setAssigningRole(false);
    }
  };

  return (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Attribuer un Rôle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attribuer un rôle à un utilisateur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                id="email" 
                placeholder="utilisateur@exemple.com" 
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedRole === 'user' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('user')}
                className="justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Utilisateur
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'sfd_admin' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('sfd_admin')}
                className="justify-start"
              >
                <UserCog className="h-4 w-4 mr-2" />
                Admin SFD
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'admin' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('admin')}
                className="justify-start"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Super Admin
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleAssignRole}
            disabled={assigningRole}
          >
            {assigningRole ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Attribution...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Attribuer le rôle
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
