
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, FileDown, Filter, AlertCircle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface ModificationHistoryItem {
  id: string;
  user_name?: string;
  user_email?: string;
  action: string;
  created_at: string;
  target_resource?: string;
  details: {
    [key: string]: any;
    sfd_id?: string;
    modified_fields?: Record<string, any>;
  };
}

export function SfdHistory() {
  const [history, setHistory] = useState<ModificationHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ModificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [sfdFilter, setSfdFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // SFD list for filter
  const [sfdList, setSfdList] = useState<{id: string, name: string}[]>([]);
  
  useEffect(() => {
    fetchSfdList();
    fetchModificationHistory();
  }, []);
  
  const fetchSfdList = async () => {
    try {
      const { data, error } = await supabase
        .from('sfds')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) throw error;
      
      setSfdList(data || []);
    } catch (error) {
      console.error('Error fetching SFD list:', error);
      setError('Impossible de récupérer la liste des SFDs');
    }
  };
  
  const fetchModificationHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .in('category', ['sfd_operations', 'subsidy_operations'])
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      // Fetch user details for each log entry
      const historyWithUserDetails = await Promise.all(
        (data || []).map(async (item) => {
          let userName = 'Système';
          let userEmail = '';
          
          if (item.user_id && item.user_id !== '00000000-0000-0000-0000-000000000000') {
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', item.user_id)
              .single();
              
            const { data: userAuthData, error: authError } = await supabase
              .auth.admin.getUserById(item.user_id);
                
            if (userData && !userError) {
              userName = userData.full_name || 'Utilisateur inconnu';
            }
            
            if (userAuthData && !authError) {
              userEmail = userAuthData.user.email || '';
            }
          }
          
          return {
            id: item.id,
            user_name: userName,
            user_email: userEmail,
            action: item.action,
            created_at: item.created_at,
            target_resource: item.target_resource,
            details: item.details || {}
          };
        })
      );
      
      setHistory(historyWithUserDetails);
      setFilteredHistory(historyWithUserDetails);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching modification history:', error);
      setError(error.message || 'Impossible de récupérer l\'historique des modifications');
      setLoading(false);
    }
  };
  
  // Apply filters
  useEffect(() => {
    let filtered = [...history];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.user_name?.toLowerCase().includes(term)) ||
        (item.user_email?.toLowerCase().includes(term)) ||
        (item.action.toLowerCase().includes(term)) ||
        (JSON.stringify(item.details).toLowerCase().includes(term))
      );
    }
    
    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(item => item.action === actionFilter);
    }
    
    // SFD filter
    if (sfdFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.details?.sfd_id === sfdFilter || 
        item.target_resource === sfdFilter
      );
    }
    
    // Date filters
    if (startDate && isValid(startDate)) {
      filtered = filtered.filter(item => {
        const itemDate = parseISO(item.created_at);
        return itemDate >= startDate;
      });
    }
    
    if (endDate && isValid(endDate)) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(item => {
        const itemDate = parseISO(item.created_at);
        return itemDate <= endOfDay;
      });
    }
    
    setFilteredHistory(filtered);
  }, [searchTerm, actionFilter, sfdFilter, startDate, endDate, history]);
  
  const getActionDisplay = (action: string) => {
    switch(action) {
      case 'create_sfd':
        return { label: 'Création SFD', color: 'bg-green-100 text-green-800' };
      case 'update_sfd':
        return { label: 'Mise à jour SFD', color: 'bg-blue-100 text-blue-800' };
      case 'delete_sfd':
        return { label: 'Suppression SFD', color: 'bg-red-100 text-red-800' };
      case 'suspend_sfd':
        return { label: 'Suspension SFD', color: 'bg-yellow-100 text-yellow-800' };
      case 'reactivate_sfd':
        return { label: 'Réactivation SFD', color: 'bg-green-100 text-green-800' };
      case 'assign_admin':
        return { label: 'Assignation Admin', color: 'bg-purple-100 text-purple-800' };
      case 'allocate_subsidy':
        return { label: 'Allocation Subvention', color: 'bg-amber-100 text-amber-800' };
      default:
        return { label: action, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  const formatDetails = (details: any, action: string) => {
    if (!details) return '';
    
    try {
      if (action === 'update_sfd' && details.modified_fields) {
        return Object.entries(details.modified_fields).map(([key, value]) => {
          const oldValue = (value as any).old;
          const newValue = (value as any).new;
          return `${key}: "${oldValue}" → "${newValue}"`;
        }).join(', ');
      }
      
      if (action === 'create_sfd' && details.sfd_data) {
        const data = details.sfd_data;
        return `Nom: "${data.name}", Code: "${data.code}", Région: "${data.region || 'Non spécifiée'}"`;
      }
      
      if (action === 'allocate_subsidy' && details.amount) {
        return `Montant: ${details.amount} FCFA, SFD: "${details.sfd_name || 'Inconnu'}"`;
      }
      
      return JSON.stringify(details);
    } catch (e) {
      console.error('Error formatting details:', e);
      return 'Détails non formatables';
    }
  };
  
  const getSfdName = (sfdId: string) => {
    const sfd = sfdList.find(s => s.id === sfdId);
    return sfd ? sfd.name : 'SFD Inconnue';
  };
  
  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(history.map(item => item.action)));
  
  const exportHistory = () => {
    // Implementation for export functionality
    console.log('Exporting history:', filteredHistory);
    // Add CSV export implementation here
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Historique des Modifications SFD</CardTitle>
        <CardDescription>
          Suivez toutes les modifications apportées aux SFDs et aux subventions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {getActionDisplay(action).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sfdFilter} onValueChange={setSfdFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="SFD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les SFDs</SelectItem>
                  {sfdList.map((sfd) => (
                    <SelectItem key={sfd.id} value={sfd.id}>
                      {sfd.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={exportHistory}>
                <FileDown className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Du</span>
              <DatePicker
                selected={startDate}
                onSelect={setStartDate}
                locale={fr}
                placeholder="Date début"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">au</span>
              <DatePicker
                selected={endDate}
                onSelect={setEndDate}
                locale={fr}
                placeholder="Date fin"
              />
            </div>
            
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
              >
                Réinitialiser les dates
              </Button>
            )}
          </div>
        </div>
        
        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
          </div>
        ) : (
          <>
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun résultat trouvé pour ces critères de recherche.
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  {filteredHistory.length} {filteredHistory.length > 1 ? 'résultats trouvés' : 'résultat trouvé'}
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>SFD</TableHead>
                        <TableHead className="w-[40%]">Détails</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {format(parseISO(item.created_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.user_name}</span>
                              {item.user_email && (
                                <span className="text-xs text-muted-foreground">{item.user_email}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getActionDisplay(item.action).color}>
                              {getActionDisplay(item.action).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.details.sfd_id ? (
                              getSfdName(item.details.sfd_id)
                            ) : item.target_resource ? (
                              getSfdName(item.target_resource)
                            ) : (
                              <span className="text-muted-foreground text-xs">Non applicable</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md break-words">
                            {formatDetails(item.details, item.action)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
