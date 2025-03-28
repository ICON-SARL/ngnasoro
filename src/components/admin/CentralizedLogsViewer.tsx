
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getAuditLogs, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';
import { AlertCircle, Search, RefreshCw, Download, X } from 'lucide-react';
import { DataPagination } from '@/components/ui/data-pagination';
import { exportAuditLogsToCSV } from '@/utils/audit/auditLoggerExport';

export function CentralizedLogsViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare filter options based on current tab and filters
      const options: any = {
        page,
        pageSize,
        sortBy: 'created_at',
        sortOrder: { ascending: false }
      };
      
      // Apply tab filters
      if (currentTab === 'errors') {
        options.severity = AuditLogSeverity.ERROR;
      } else if (currentTab === 'warnings') {
        options.severity = AuditLogSeverity.WARNING;
      } else if (currentTab === 'sensitive') {
        options.category = AuditLogCategory.LOAN_OPERATIONS;
      }
      
      // Apply additional filters
      if (selectedCategory && currentTab === 'all') {
        options.category = selectedCategory;
      }
      
      if (selectedSeverity && currentTab !== 'errors' && currentTab !== 'warnings') {
        options.severity = selectedSeverity;
      }
      
      // Fetch logs with filters
      const logsData = await getAuditLogs(options);
      
      // Apply search filter client-side for simplicity (in a production app, would be server-side)
      let filteredLogs = logsData;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredLogs = logsData.filter((log: any) => {
          return (
            (log.action && log.action.toLowerCase().includes(query)) ||
            (log.target_resource && log.target_resource.toLowerCase().includes(query)) ||
            (log.error_message && log.error_message.toLowerCase().includes(query)) ||
            (log.details && JSON.stringify(log.details).toLowerCase().includes(query))
          );
        });
      }
      
      setLogs(filteredLogs);
      setTotalCount(filteredLogs.length); // For demonstration; in reality, you would get the count from the API
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, [currentTab, page, pageSize, selectedCategory, selectedSeverity]);
  
  const handleSearch = () => {
    fetchLogs();
  };
  
  const handleExport = async () => {
    try {
      await exportAuditLogsToCSV();
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export logs");
    }
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSeverity('');
    setPage(0);
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case AuditLogSeverity.ERROR:
        return <Badge className="bg-red-500">Erreur</Badge>;
      case AuditLogSeverity.WARNING:
        return <Badge className="bg-amber-500">Alerte</Badge>;
      case AuditLogSeverity.CRITICAL:
        return <Badge className="bg-purple-600">Critique</Badge>;
      default:
        return <Badge className="bg-blue-500">Info</Badge>;
    }
  };
  
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case AuditLogCategory.LOAN_OPERATIONS:
        return <Badge className="bg-green-600">Prêts</Badge>;
      case AuditLogCategory.SFD_OPERATIONS:
        return <Badge className="bg-indigo-600">SFD</Badge>;
      case AuditLogCategory.SYSTEM:
        return <Badge className="bg-slate-600">Système</Badge>;
      case AuditLogCategory.ACCESS_CONTROL:
        return <Badge className="bg-purple-600">Sécurité</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Logs Centralisés</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardTitle>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-full"
            />
          </div>
          
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les catégories</SelectItem>
              {Object.values(AuditLogCategory).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedSeverity}
            onValueChange={setSelectedSeverity}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sévérité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les sévérités</SelectItem>
              {Object.values(AuditLogSeverity).map((severity) => (
                <SelectItem key={severity} value={severity}>
                  {severity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
            
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous les logs</TabsTrigger>
            <TabsTrigger value="errors">Erreurs</TabsTrigger>
            <TabsTrigger value="warnings">Alertes</TabsTrigger>
            <TabsTrigger value="sensitive">Opérations sensibles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {renderLogsTable()}
          </TabsContent>
          
          <TabsContent value="errors" className="mt-0">
            {renderLogsTable()}
          </TabsContent>
          
          <TabsContent value="warnings" className="mt-0">
            {renderLogsTable()}
          </TabsContent>
          
          <TabsContent value="sensitive" className="mt-0">
            {renderLogsTable()}
          </TabsContent>
        </Tabs>
        
        <DataPagination
          currentPage={page}
          totalPages={Math.ceil(totalCount / pageSize)}
          totalItems={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="mt-4"
        />
      </CardContent>
    </Card>
  );
  
  function renderLogsTable() {
    if (loading) {
      return <div className="flex justify-center p-8">Chargement des logs...</div>;
    }
    
    if (logs.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          Aucun log trouvé pour ces critères
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-semibold">Date & Heure</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Catégorie</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Sévérité</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Détails</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="border-b hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{log.action}</td>
                <td className="px-4 py-3 text-sm">
                  {getCategoryBadge(log.category)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {getSeverityBadge(log.severity)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge className={log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                    {log.status === 'success' ? 'Succès' : 'Échec'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="max-w-[300px] truncate">
                    {log.error_message ? (
                      <span className="text-red-500">{log.error_message}</span>
                    ) : (
                      <span>
                        {log.details ? JSON.stringify(log.details).substring(0, 100) : ''}
                        {log.details && JSON.stringify(log.details).length > 100 ? '...' : ''}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
