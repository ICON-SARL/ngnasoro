
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { AuditLogCategory } from '@/utils/audit';
import { fr } from 'date-fns/locale';

// Type for the modification history
interface ModificationHistoryItem {
  id: string;
  user_name: string;
  user_email: string;
  action: string;
  created_at: string;
  details: {
    sfd_id?: string;
    modified_fields?: Record<string, any>;
    [key: string]: any;
  };
}

export function SfdHistory() {
  const [history, setHistory] = useState<ModificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sfdFilter, setSfdFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sfds, setSfds] = useState<{id: string, name: string}[]>([]);

  // Function to fetch SFD modification history
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Query for SFD operations in audit logs
      let query = supabase
        .from('audit_logs')
        .select('*, profiles:user_id(full_name, email)')
        .eq('category', AuditLogCategory.SFD_OPERATIONS)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (sfdFilter) {
        query = query.filter('details->sfd_id', 'eq', sfdFilter);
      }
      
      if (actionFilter) {
        query = query.eq('action', actionFilter);
      }
      
      if (dateFilter) {
        const date = new Date(dateFilter);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        
        query = query
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDay.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match our display needs
      const formattedData = data.map(item => ({
        id: item.id,
        user_name: item.profiles?.full_name || 'Utilisateur inconnu',
        user_email: item.profiles?.email || '',
        action: item.action,
        created_at: item.created_at,
        details: item.details || {}
      }));
      
      setHistory(formattedData);
    } catch (error) {
      console.error('Error fetching SFD history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch SFDs for the filter dropdown
  const fetchSfds = async () => {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setSfds(data || []);
    } catch (error) {
      console.error('Error fetching SFDs:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchHistory();
    fetchSfds();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchHistory();
  }, [sfdFilter, actionFilter, dateFilter]);

  // Function to format action label for display
  const formatAction = (action: string) => {
    switch (action) {
      case 'create_sfd':
        return 'Création';
      case 'update_sfd':
        return 'Modification';
      case 'suspend_sfd':
        return 'Suspension';
      case 'reactivate_sfd':
        return 'Réactivation';
      default:
        return action;
    }
  };

  // Function to format modified fields for display
  const formatModifiedFields = (details: any) => {
    if (!details?.modified_fields) return 'N/A';
    
    return Object.entries(details.modified_fields).map(([field, values]: [string, any]) => (
      <div key={field} className="mb-1">
        <span className="font-medium">{field}:</span>{' '}
        <span className="text-red-500">{values.from || 'vide'}</span>{' '}
        <span className="text-gray-500">→</span>{' '}
        <span className="text-green-500">{values.to || 'vide'}</span>
      </div>
    ));
  };

  // Function to handle export to CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;
    
    // Create CSV content
    const headers = ['ID', 'Utilisateur', 'Email', 'Action', 'Date', 'SFD', 'Détails'];
    
    const rows = history.map(item => [
      item.id,
      item.user_name,
      item.user_email,
      formatAction(item.action),
      format(new Date(item.created_at), 'dd/MM/yyyy HH:mm'),
      sfds.find(sfd => sfd.id === item.details.sfd_id)?.name || item.details.sfd_id || 'N/A',
      JSON.stringify(item.details.modified_fields || {})
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historique-sfds-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <CardTitle>Historique des modifications</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={history.length === 0}
          >
            Exporter CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="w-full sm:w-1/3">
            <Select
              value={sfdFilter}
              onValueChange={setSfdFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par SFD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les SFDs</SelectItem>
                {sfds.map(sfd => (
                  <SelectItem key={sfd.id} value={sfd.id}>{sfd.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/3">
            <Select
              value={actionFilter}
              onValueChange={setActionFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les actions</SelectItem>
                <SelectItem value="create_sfd">Création</SelectItem>
                <SelectItem value="update_sfd">Modification</SelectItem>
                <SelectItem value="suspend_sfd">Suspension</SelectItem>
                <SelectItem value="reactivate_sfd">Réactivation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/3 relative">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filtrer par date"
              className="pr-10"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none h-4 w-4" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun historique de modification trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>SFD</TableHead>
                  <TableHead>Modifications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.user_name}
                      <div className="text-xs text-muted-foreground">{item.user_email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.action === 'create_sfd' 
                            ? 'default' 
                            : item.action === 'suspend_sfd' 
                              ? 'destructive' 
                              : item.action === 'reactivate_sfd'
                                ? 'success'
                                : 'secondary'
                        }
                      >
                        {formatAction(item.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {sfds.find(sfd => sfd.id === item.details.sfd_id)?.name || item.details.sfd_id || 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {item.action === 'create_sfd' 
                        ? 'Création SFD' 
                        : formatModifiedFields(item.details)
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
