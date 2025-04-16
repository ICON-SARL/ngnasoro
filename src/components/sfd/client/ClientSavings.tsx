
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ClientSavingsProps {
  clientId: string;
  sfdId: string;
}

export function ClientSavings({ clientId, sfdId }: ClientSavingsProps) {
  const { data: account } = useQuery({
    queryKey: ['client-savings', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts')
        .select('balance, updated_at')
        .eq('user_id', clientId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solde d'épargne</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {account?.balance?.toLocaleString('fr-FR')} FCFA
        </div>
        {account?.updated_at && (
          <p className="text-sm text-muted-foreground">
            Dernière mise à jour: {new Date(account.updated_at).toLocaleDateString('fr-FR')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
