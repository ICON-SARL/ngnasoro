
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, Users, User, Edit, Trash } from 'lucide-react';
import { Role, Permission } from './types';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RoleCardProps {
  role: Role;
  permissions: Permission[];
  onEdit: () => void;
  onDelete: () => void;
}

export function RoleCard({ role, permissions, onEdit, onDelete }: RoleCardProps) {
  return (
    <Card key={role.id}>
      <CardHeader className="pb-2">
        <div className="flex items-center mb-1">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
            role.name === 'Super Admin' 
              ? 'bg-purple-100 text-purple-700' 
              : role.name === 'Administrateur SFD'
              ? 'bg-blue-100 text-blue-700'
              : role.name === 'Auditeur'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {role.name === 'Super Admin' 
              ? <Shield className="h-4 w-4" />
              : role.name === 'Administrateur SFD'
              ? <Users className="h-4 w-4" />
              : role.name === 'Auditeur'
              ? <User className="h-4 w-4" />
              : <User className="h-4 w-4" />
            }
          </div>
          <CardTitle>{role.name}</CardTitle>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-sm font-medium">Permissions</div>
          <div className="grid grid-cols-2 gap-2">
            {role.permissions.map(permId => {
              const permission = permissions.find(p => p.id === permId);
              return permission ? (
                <div key={permId} className="flex items-center text-sm text-muted-foreground">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  {permission.name}
                </div>
              ) : null;
            })}
          </div>
        </div>
        
        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5 mr-1" />
            Modifier
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash className="h-3.5 w-3.5 mr-1" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action ne peut pas être annulée. Cela supprimera définitivement le rôle {role.name} et pourrait affecter les utilisateurs ayant ce rôle.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
