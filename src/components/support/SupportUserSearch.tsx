import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';

interface UserResult {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  roles: string[];
}

const SupportUserSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(20);

      if (!profiles?.length) {
        setResults([]);
        return;
      }

      const userIds = profiles.map(p => p.id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      const roleMap = new Map<string, string[]>();
      roles?.forEach(r => {
        const existing = roleMap.get(r.user_id) || [];
        existing.push(r.role);
        roleMap.set(r.user_id, existing);
      });

      setResults(
        profiles.map(p => ({
          ...p,
          roles: roleMap.get(p.id) || ['user'],
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'support_admin': return 'destructive';
      case 'admin': return 'default';
      case 'sfd_admin': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Recherche Utilisateurs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Nom, email ou téléphone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="divide-y divide-border rounded-lg border">
            {results.map((user) => (
              <div key={user.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{user.full_name || 'Sans nom'}</p>
                  <p className="text-xs text-muted-foreground">{user.email || user.phone || user.id}</p>
                </div>
                <div className="flex gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant={roleBadgeVariant(role) as any} className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && query && !loading && (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun résultat trouvé</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SupportUserSearch;
