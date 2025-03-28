
import React from 'react';
import { User, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

interface UsersListProps {
  users: UserItem[];
}

export const UsersList = ({ users }: UsersListProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Collaborateurs</h3>
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="divide-y">
          {users.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51]">
                  <User className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={
                  user.role === 'Administrateur' 
                    ? 'bg-purple-50 text-purple-700' 
                    : user.role === 'Superviseur'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-green-50 text-green-700'
                }>
                  {user.role}
                </Badge>
                <Badge className={
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }>
                  {user.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
