
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataPagination } from '@/components/ui/data-pagination';
import { Badge } from '@/components/ui/badge';
import { useSyncData } from '@/hooks/useSyncData';
import { Separator } from '@/components/ui/separator';
import { Download, Filter, RefreshCw, Search, Shield, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DatePicker } from '@/components/ui/date-picker';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/auditLogger';
import { toast } from '@/hooks/use-toast';
import { syncService } from '@/utils/api/syncService';

export function SfdAuditLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const {
    pagination,
    goToPage,
    changePageSize,
    changeSorting,
    resetFilters,
    applyDateFilter,
  } = useSyncData();
  
  // Configure audit logs query with our specific filters
  const { 
    auditLogsQuery: { data: auditLogsData, isLoading, refetch }
  } = useSyncData();
  
  const handleApplyFilters = () => {
    if (startDate || endDate) {
      applyDateFilter(
        startDate ? startDate.toISOString() : undefined,
        endDate ? endDate.toISOString() : undefined
      );
    }
    
    // The specific filters for audit logs will be applied through the hook
    refetch();
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSeverity('');
    setSelectedStatus('');
    setStartDate(undefined);
    setEndDate(undefined);
    resetFilters();
  };
  
  const handleExportCsv = async () => {
    try {
      toast({
        title: "Export en cours",
        description: "Préparation du fichier CSV...",
      });
      
      const filters = {
        ...(startDate ? { startDate: startDate.toISOString() } : {}),
        ...(endDate ? { endDate: endDate.toISOString() } : {}),
        ...(selectedCategory ? { category: selectedCategory } : {}),
        ...(selectedSeverity ? { severity: selectedSeverity } : {}),
        ...(selectedStatus ? { status: selectedStatus as 'success' | 'failure' } : {})
      };
      
      const blob = await syncService.exportAuditLogs(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `journal-audit-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export réussi",
        description: "Le journal d'audit a été exporté avec succès",
      });
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export du journal d'audit",
        variant: "destructive"
      });
    }
  };
  
  // Format the timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'dd MMM yyyy, HH:mm', { locale: fr });
  };
  
  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Avertissement</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erreur</Badge>;
      case 'critical':
        return <Badge className="bg-purple-100 text-purple-800">Critique</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{severity}</Badge>;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <div className="flex items-center space-x-1">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Succès</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1">
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Échec</span>
        </div>
      );
    }
  };
  
  // Format the action name for display
  const formatActionName = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const filteredLogs = auditLogsData?.data?.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.action && log.action.toLowerCase().includes(searchLower)) ||
      (log.user_id && log.user_id.toLowerCase().includes(searchLower)) ||
      (log.target_resource && log.target_resource.toLowerCase().includes(searchLower)) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower))
    );
  }) || [];
  
  const totalPages = auditLogsData?.pagination?.totalPages || 1;
  const totalItems = auditLogsData?.pagination?.totalCount || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Journal d'Audit
          </h2>
          <p className="text-sm text-muted-foreground">
            Traçabilité complète des actions effectuées par les administrateurs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtres
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
          >
            <Download className="h-4 w-4 mr-1" />
            Exporter CSV
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les logs..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Catégorie</label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {Object.values(AuditLogCategory).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Sévérité</label>
                <Select 
                  value={selectedSeverity} 
                  onValueChange={setSelectedSeverity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les sévérités</SelectItem>
                    {Object.values(AuditLogSeverity).map(severity => (
                      <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Statut</label>
                <Select 
                  value={selectedStatus} 
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="success">Succès</SelectItem>
                    <SelectItem value="failure">Échec</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Date de début</label>
                <DatePicker
                  selected={startDate}
                  onSelect={setStartDate}
                  placeholder="Choisir une date"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Date de fin</label>
                <DatePicker
                  selected={endDate}
                  onSelect={setEndDate}
                  placeholder="Choisir une date"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClearFilters}>
                Réinitialiser
              </Button>
              <Button onClick={handleApplyFilters}>
                Appliquer les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
              <p className="mt-4 text-sm text-gray-600">Chargement des données d'audit...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Shield className="h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">Aucune entrée d'audit trouvée.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Horodatage</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Administrateur</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Sévérité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="max-w-[200px]">Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center text-xs">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            {formatTimestamp(log.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatActionName(log.action)}
                        </TableCell>
                        <TableCell>
                          {log.user_id ? log.user_id.substring(0, 8) : 'Système'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(log.severity)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.status)}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {log.error_message ? (
                            <span className="text-red-600">{log.error_message}</span>
                          ) : (
                            log.details ? (
                              <span className="text-xs">{JSON.stringify(log.details)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <DataPagination
                currentPage={pagination.page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pagination.pageSize}
                onPageChange={goToPage}
                onPageSizeChange={changePageSize}
                className="mt-4"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
