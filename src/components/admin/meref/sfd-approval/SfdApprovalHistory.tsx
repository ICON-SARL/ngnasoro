import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ApprovalHistoryEntry {
  id: string;
  sfd_id: string;
  reviewed_by: string;
  action: string;
  comments: string;
  reviewed_at: string;
  sfd_name?: string;
  reviewer_name?: string;
}

export function SfdApprovalHistory() {
  const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('sfd_approval_history')
        .select(`
          *,
          sfds!sfd_id (name),
          profiles!reviewed_by (full_name)
        `)
        .order('reviewed_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedHistory = data?.map((entry: any) => ({
        id: entry.id,
        sfd_id: entry.sfd_id,
        reviewed_by: entry.reviewed_by,
        action: entry.action,
        comments: entry.comments,
        reviewed_at: entry.reviewed_at,
        sfd_name: entry.sfds?.name,
        reviewer_name: entry.profiles?.full_name
      })) || [];

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching approval history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Approbations</CardTitle>
        <CardDescription>20 dernières décisions</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>Chargement...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Aucun historique disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <Card key={entry.id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {entry.action === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-semibold">{entry.sfd_name || 'SFD Inconnu'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(entry.reviewed_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline"
                        className={entry.action === 'approved' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                        }
                      >
                        {entry.action === 'approved' ? 'Approuvé' : 'Rejeté'}
                      </Badge>
                    </div>

                    {entry.comments && (
                      <p className="text-sm text-muted-foreground mb-2 p-2 bg-muted/50 rounded">
                        {entry.comments}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>Par {entry.reviewer_name || 'Administrateur'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
