
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { getAuditLogs, AuditLogCategory, AuditLogSeverity } from '@/utils/auditLogger';

export function SfdAuditLog() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const options: any = {
        limit: 100,
      };
      
      if (categoryFilter) {
        options.category = categoryFilter;
      }
      
      if (severityFilter) {
        options.severity = severityFilter;
      }
      
      if (startDate) {
        options.startDate = startDate.toISOString();
      }
      
      if (endDate) {
        options.endDate = endDate.toISOString();
      }
      
      const logs = await getAuditLogs(options);
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchAuditLogs();
  }, [categoryFilter, severityFilter, startDate, endDate]);
  
  // Filter logs by search term
  const filteredLogs = auditLogs.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(searchLower)) ||
      (log.user_id && log.user_id.toLowerCase().includes(searchLower)) ||
      (log.target_resource && log.target_resource.toLowerCase().includes(searchLower)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower))
    );
  });
  
  // Get severity badge styling
  const getSeverityBadge = (severity: AuditLogSeverity) => {
    switch (severity) {
      case AuditLogSeverity.INFO:
        return <Badge variant="outline" className="bg-blue-50 text-blue-600">Info</Badge>;
      case AuditLogSeverity.WARNING:
        return <Badge variant="outline" className="bg-amber-50 text-amber-600">Avertissement</Badge>;
      case AuditLogSeverity.ERROR:
        return <Badge variant="outline" className="bg-red-50 text-red-600">Erreur</Badge>;
      case AuditLogSeverity.CRITICAL:
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };
  
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return <Badge className="bg-green-100 text-green-800">Succès</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Échec</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Historique d'audit (SFDs)</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrer par catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les catégories</SelectItem>
            <SelectItem value={AuditLogCategory.SFD_OPERATIONS}>Opérations SFD</SelectItem>
            <SelectItem value={AuditLogCategory.AUTHENTICATION}>Authentification</SelectItem>
            <SelectItem value={AuditLogCategory.DATA_ACCESS}>Accès aux données</SelectItem>
            <SelectItem value={AuditLogCategory.CONFIGURATION}>Configuration</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par sévérité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les sévérités</SelectItem>
            <SelectItem value={AuditLogSeverity.INFO}>Info</SelectItem>
            <SelectItem value={AuditLogSeverity.WARNING}>Avertissement</SelectItem>
            <SelectItem value={AuditLogSeverity.ERROR}>Erreur</SelectItem>
            <SelectItem value={AuditLogSeverity.CRITICAL}>Critique</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] pl-3 text-left font-normal">
              {startDate ? format(startDate, 'dd/MM/yyyy') : "Date de début"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] pl-3 text-left font-normal">
              {endDate ? format(endDate, 'dd/MM/yyyy') : "Date de fin"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        {(startDate || endDate || categoryFilter || severityFilter) && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setStartDate(undefined);
              setEndDate(undefined);
              setCategoryFilter('');
              setSeverityFilter('');
              setSearchTerm('');
            }}
          >
            Réinitialiser les filtres
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="text-center p-8 text-muted-foreground">
          Chargement des journaux d'audit...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          Aucun journal d'audit trouvé avec les critères de recherche actuels.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Sévérité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-medium">{log.action}</TableCell>
                  <TableCell className="truncate max-w-[100px]">{log.user_id}</TableCell>
                  <TableCell>{log.category}</TableCell>
                  <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
