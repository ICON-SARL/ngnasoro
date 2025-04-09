
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/components/ui/avatar';

export function CurrentSfdBadge() {
  const { activeSfdId } = useAuth();

  const { data: sfdData } = useQuery({
    queryKey: ['sfd-details', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return null;
      
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name, code, region, logo_url')
        .eq('id', activeSfdId)
        .single();
        
      if (error) {
        console.error('Error fetching SFD details:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!activeSfdId
  });

  if (!activeSfdId || !sfdData) {
    return null;
  }

  return (
    <Badge variant="secondary" className="ml-2 flex items-center">
      {sfdData.logo_url && (
        <Avatar className="h-4 w-4 mr-1">
          <img src={sfdData.logo_url} alt={sfdData.name} />
        </Avatar>
      )}
      {sfdData.name}
    </Badge>
  );
}

export default CurrentSfdBadge;
