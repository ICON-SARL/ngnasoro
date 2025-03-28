
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  UserCog, 
  ShieldCheck, 
  Users, 
  Search, 
  Loader2,
  User 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UserWithRole } from './utils/roleUtils';

interface UsersListProps {
  users: UserWithRole[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function UsersList({ users, loading, searchTerm, onSearchChange }: UsersListProps) {
  return (
    <div className="rounded-md border">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      <div className="divide-y">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#0D6A51]" />
            <p className="mt-2 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-8 w-8 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-600">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white
                  ${user.role === 'admin' 
                    ? 'bg-amber-600' 
                    : user.role === 'sfd_admin' 
                    ? 'bg-blue-600' 
                    : 'bg-[#0D6A51]'}`
                }>
                  {user.role === 'admin' ? (
                    <ShieldCheck className="h-5 w-5" />
                  ) : user.role === 'sfd_admin' ? (
                    <UserCog className="h-5 w-5" />
                  ) : (
                    <Users className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium">{user.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge className={
                user.role === 'admin' 
                  ? 'bg-amber-100 text-amber-800' 
                  : user.role === 'sfd_admin'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }>
                {user.role === 'admin' ? 'Super Admin' : 
                 user.role === 'sfd_admin' ? 'Admin SFD' : 'Utilisateur'}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
