import React, { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AuditLogCategory,
  AuditLogSeverity,
  getAuditLogs,
  exportAuditLogsToCSV
} from '@/utils/audit';
import { useAuth } from '@/hooks/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Download, 
  FileText,
  Search,
  Filter,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  category: AuditLogCategory;
  severity: AuditLogSeverity;
  status: string;
  target_resource?: string;
  error_message?: string;
  details?: Record<string, any>;
}

const DetailedAuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  const [isExporting, setIsExporting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [dateRange, categoryFilter, severityFilter, user]);

  const fetchLogs = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);

      // Prepare filter options
      const filterOptions: any = {
        limit: 100
      };
      
      // Add category filter
      if (categoryFilter !== 'all') {
        filterOptions.category = categoryFilter as AuditLogCategory;
      }
      
      // Add severity filter
      if (severityFilter !== 'all') {
        filterOptions.severity = severityFilter as AuditLogSeverity;
      }
      
      // Add date range filter
      if (dateRange?.from) {
        filterOptions.startDate = dateRange.from;
      }
      if (dateRange?.to) {
        // Set to end of day
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        filterOptions.endDate = endDate;
      }
      
      const { logs: fetchedLogs } = await getAuditLogs(filterOptions);
      
      // Apply search filter in memory (since it's a text search across multiple fields)
      let filteredLogs = fetchedLogs as AuditLog[];
      
      if (searchTerm) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.error_message && log.error_message.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.target_resource && log.target_resource.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setLogs(filteredLogs);
      
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les journaux d\'audit.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      
      // Prepare filter options for export (same as current view)
      const filterOptions: any = {};
      
      if (categoryFilter !== 'all') {
        filterOptions.category = categoryFilter as AuditLogCategory;
      }
      
      if (severityFilter !== 'all') {
        filterOptions.severity = severityFilter as AuditLogSeverity;
      }
      
      if (dateRange?.from) {
        filterOptions.startDate = dateRange.from;
      }
      if (dateRange?.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        filterOptions.endDate = endDate;
      }
      
      const result = await exportAuditLogsToCSV(filterOptions);
      
      if (result.success) {
        // Create a download link
        const blob = new Blob([result.csvString!], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', result.filename!);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Export réussi',
          description: 'Les journaux d\'audit ont été exportés avec succès.',
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: 'Erreur d\'exportation',
        description: 'Impossible d\'exporter les journaux d\'audit.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getSeverityBadge = (severity: AuditLogSeverity) => {
    switch (severity) {
      case AuditLogSeverity.CRITICAL:
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      case AuditLogSeverity.ERROR:
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case AuditLogSeverity.WARNING:
        return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>;
      case AuditLogSeverity.INFO:
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
    }
  };

  const getSeverityIcon = (severity: AuditLogSeverity) => {
    switch (severity) {
      case AuditLogSeverity.CRITICAL:
      case AuditLogSeverity.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case AuditLogSeverity.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case AuditLogSeverity.INFO:
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getCategoryLabel = (category: AuditLogCategory) => {
    switch (category) {
      case AuditLogCategory.AUTHENTICATION:
        return 'Authentification';
      case AuditLogCategory.DATA_ACCESS:
        return 'Accès aux données';
      case AuditLogCategory.ADMIN_ACTION:
        return 'Action administrateur';
      case AuditLogCategory.SFD_OPERATIONS:
        return 'Opérations SFD';
      case AuditLogCategory.SUBSIDY_OPERATIONS:
        return 'Opérations de subvention';
      case AuditLogCategory.USER_MANAGEMENT:
        return 'Gestion utilisateur';
      case AuditLogCategory.SYSTEM:
        return 'Système';
      default:
        return category;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: fr });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="space-y-2">
              <div className="text-sm font-medium">Période</div>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} className="w-full" />
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Rechercher par action, ressource ou message d'erreur..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value={AuditLogCategory.AUTHENTICATION}>Authentification</SelectItem>
                  <SelectItem value={AuditLogCategory.DATA_ACCESS}>Accès aux données</SelectItem>
                  <SelectItem value={AuditLogCategory.ADMIN_ACTION}>Action administrateur</SelectItem>
                  <SelectItem value={AuditLogCategory.SFD_OPERATIONS}>Opérations SFD</SelectItem>
                  <SelectItem value={AuditLogCategory.SUBSIDY_OPERATIONS}>Opérations de subvention</SelectItem>
                  <SelectItem value={AuditLogCategory.USER_MANAGEMENT}>Gestion utilisateur</SelectItem>
                  <SelectItem value={AuditLogCategory.SYSTEM}>Système</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par sévérité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sévérités</SelectItem>
                  <SelectItem value={AuditLogSeverity.INFO}>Info</SelectItem>
                  <SelectItem value={AuditLogSeverity.WARNING}>Avertissement</SelectItem>
                  <SelectItem value={AuditLogSeverity.ERROR}>Erreur</SelectItem>
                  <SelectItem value={AuditLogSeverity.CRITICAL}>Critique</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={fetchLogs}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportCSV} 
                disabled={isExporting || logs.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Aucun log trouvé</h3>
              <p className="text-sm text-gray-500 mt-1">
                Aucun enregistrement d'audit ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Sévérité</TableHead>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Message d'erreur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getSeverityIcon(log.severity)}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatDate(log.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          <span className="text-xs">{log.user_id.substring(0, 8)}...</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{getCategoryLabel(log.category)}</TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      <TableCell>{log.target_resource || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          className={log.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : log.status === 'failure' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.error_message || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedAuditLogViewer;
