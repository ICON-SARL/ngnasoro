import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, FileText, Download, Eye, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReportsHistoryPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['meref-reports-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_reports')
        .select(`
          *,
          definition:report_definitions(name, type)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredReports = reports?.filter(report => 
    report.definition?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.definition?.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Terminé</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Échoué</Badge>;
      case 'processing':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />En cours</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'pdf':
        return <Badge className="bg-red-100 text-red-800">PDF</Badge>;
      case 'excel':
        return <Badge className="bg-green-100 text-green-800">Excel</Badge>;
      case 'csv':
        return <Badge className="bg-blue-100 text-blue-800">CSV</Badge>;
      default:
        return <Badge variant="secondary">{format}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Historique des Rapports</h1>
          <p className="text-muted-foreground">Consultez et téléchargez les rapports générés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{reports?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Total Rapports</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {reports?.filter(r => r.status === 'completed').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Terminés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {reports?.filter(r => r.status === 'processing').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">En cours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {reports?.filter(r => r.status === 'failed').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Échoués</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Rapports Générés</CardTitle>
              <CardDescription>
                {filteredReports?.length || 0} rapport(s) trouvé(s)
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredReports?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Aucun rapport trouvé
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rapport</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Généré le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports?.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.definition?.name || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{report.definition?.type || 'N/A'}</TableCell>
                    <TableCell>{getFormatBadge(report.format)}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      {report.created_at 
                        ? format(new Date(report.created_at), 'dd MMM yyyy HH:mm', { locale: fr })
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'completed' && report.result_url && (
                          <Button size="sm" variant="default">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
