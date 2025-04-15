import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  Download, 
  FileText, 
  Filter, 
  Building,
  UserCheck,
  AlertTriangle,
  Ban,
  CheckCircle,
  FileEdit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';

type SfdAuditLogEntry = {
  id: string;
  sfd_id: string;
  sfd_name: string;
  action: 'creation' | 'modification' | 'suspension' | 'reactivation' | 'validation';
  performed_by: string;
  performed_at: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
};

export function SfdAuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  // Mock audit log data
  const mockAuditLogs: SfdAuditLogEntry[] = [
    {
      id: '1',
      sfd_id: 'sfd1',
      sfd_name: 'RCPB Ouagadougou',
      action: 'creation',
      performed_by: 'Admin MEREF',
      performed_at: '2023-04-15T10:30:00Z',
      details: 'Création du compte SFD sur la plateforme',
      severity: 'info'
    },
    {
      id: '2',
      sfd_id: 'sfd1',
      sfd_name: 'RCPB Ouagadougou',
      action: 'validation',
      performed_by: 'Admin MEREF',
      performed_at: '2023-04-16T14:20:00Z',
      details: 'Validation des documents du SFD',
      severity: 'info'
    },
    {
      id: '3',
      sfd_id: 'sfd2',
      sfd_name: 'Microcred Abidjan',
      action: 'modification',
      performed_by: 'Admin MEREF',
      performed_at: '2023-04-18T09:45:00Z',
      details: 'Mise à jour des informations du SFD',
      severity: 'info'
    },
    {
      id: '4',
      sfd_id: 'sfd3',
      sfd_name: 'FUCEC Lomé',
      action: 'suspension',
      performed_by: 'Superviseur MEREF',
      performed_at: '2023-04-20T16:15:00Z',
      details: 'Suspension temporaire pour non-conformité règlementaire',
      severity: 'warning'
    },
    {
      id: '5',
      sfd_id: 'sfd3',
      sfd_name: 'FUCEC Lomé',
      action: 'reactivation',
      performed_by: 'Superviseur MEREF',
      performed_at: '2023-04-25T11:30:00Z',
      details: 'Réactivation après mise en conformité',
      severity: 'info'
    },
    {
      id: '6',
      sfd_id: 'sfd4',
      sfd_name: 'ACEP Dakar',
      action: 'modification',
      performed_by: 'Admin SFD',
      performed_at: '2023-04-26T14:00:00Z',
      details: 'Mise à jour des coordonnées par le SFD',
      severity: 'info'
    },
    {
      id: '7',
      sfd_id: 'sfd5',
      sfd_name: 'PAMECAS Thiès',
      action: 'suspension',
      performed_by: 'Directeur MEREF',
      performed_at: '2023-04-28T09:30:00Z',
      details: 'Suspension suite à des irrégularités financières majeures',
      severity: 'critical'
    }
  ];

  // Filter logs based on search, action, and date range
  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.sfd_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performed_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    const logDate = new Date(log.performed_at);
    const matchesDateRange = 
      (!dateRange.from || logDate >= dateRange.from) && 
      (!dateRange.to || logDate <= dateRange.to);
    
    return matchesSearch && matchesAction && matchesDateRange;
  });

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'creation':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'modification':
        return <FileEdit className="h-4 w-4 text-amber-500" />;
      case 'suspension':
        return <Ban className="h-4 w-4 text-red-500" />;
      case 'reactivation':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'validation':
        return <UserCheck className="h-4 w-4 text-indigo-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800">Attention</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#0D6A51]" />
            Historique des SFDs
          </CardTitle>
          <CardDescription>
            Journal d'audit des actions relatives aux SFDs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-9 w-40">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue placeholder="Filtrer par action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="creation">Création</SelectItem>
                  <SelectItem value="modification">Modification</SelectItem>
                  <SelectItem value="suspension">Suspension</SelectItem>
                  <SelectItem value="reactivation">Réactivation</SelectItem>
                  <SelectItem value="validation">Validation</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Calendar className="h-4 w-4 mr-1" />
                    Période
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <DatePickerWithRange 
                    date={dateRange} 
                    setDate={handleDateRangeChange} 
                  />
                </PopoverContent>
              </Popover>
              
              <Button variant="outline" size="sm" className="h-9">
                <Download className="h-4 w-4 mr-1" />
                Exporter
              </Button>
            </div>
          </div>
          
          {filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>SFD</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Effectuée par</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Sévérité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.performed_at).toLocaleDateString()} 
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.performed_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.sfd_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getActionIcon(log.action)}
                        <span className="ml-2">
                          {log.action === 'creation' && 'Création'}
                          {log.action === 'modification' && 'Modification'}
                          {log.action === 'suspension' && 'Suspension'}
                          {log.action === 'reactivation' && 'Réactivation'}
                          {log.action === 'validation' && 'Validation'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{log.performed_by}</TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Aucun résultat</h3>
              <p className="mt-2 text-muted-foreground">
                Aucune entrée d'audit ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
