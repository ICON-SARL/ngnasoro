import React, { useState } from 'react';
import { SfdHeader } from '@/components/sfd/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Clock, CheckCircle, XCircle, AlertTriangle, Loader2, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SfdSubsidyRequestsPage = () => {
  const { activeSfdId } = useSfdDataAccess();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    justification: '',
    priority: 'medium',
    expected_impact: '',
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['subsidy-requests', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('subsidy_requests')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeSfdId,
  });

  const { data: subsidies } = useQuery({
    queryKey: ['sfd-subsidies', activeSfdId],
    queryFn: async () => {
      if (!activeSfdId) return [];
      
      const { data, error } = await supabase
        .from('sfd_subsidies')
        .select('*')
        .eq('sfd_id', activeSfdId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeSfdId,
  });

  const createRequest = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!activeSfdId) throw new Error('SFD non sélectionné');
      
      const { error } = await supabase
        .from('subsidy_requests')
        .insert({
          sfd_id: activeSfdId,
          amount: parseFloat(data.amount),
          justification: data.justification,
          priority: data.priority,
          expected_impact: data.expected_impact,
          status: 'pending',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-requests'] });
      toast({ title: 'Demande créée', description: 'Votre demande de subvention a été soumise.' });
      setIsDialogOpen(false);
      setFormData({ amount: '', justification: '', priority: 'medium', expected_impact: '' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erreur', 
        description: error.message || 'Impossible de créer la demande',
        variant: 'destructive' 
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approuvée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejetée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Haute</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800">Moyenne</Badge>;
      case 'low':
        return <Badge variant="secondary">Basse</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const totalSubsidies = subsidies?.reduce((sum, s) => sum + s.amount, 0) || 0;
  const usedSubsidies = subsidies?.reduce((sum, s) => sum + (s.used_amount || 0), 0) || 0;
  const availableSubsidies = totalSubsidies - usedSubsidies;

  return (
    <div className="min-h-screen bg-background">
      <SfdHeader />
      
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Subventions</h1>
            <p className="text-muted-foreground">Gérez vos demandes de subvention MEREF</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouvelle demande de subvention</DialogTitle>
                <DialogDescription>
                  Soumettez une demande de subvention au MEREF pour financer vos activités.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant demandé (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priorité</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="justification">Justification</Label>
                  <Textarea
                    id="justification"
                    placeholder="Expliquez pourquoi vous avez besoin de cette subvention..."
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impact">Impact attendu</Label>
                  <Textarea
                    id="impact"
                    placeholder="Décrivez l'impact attendu de cette subvention..."
                    value={formData.expected_impact}
                    onChange={(e) => setFormData({ ...formData, expected_impact: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={() => createRequest.mutate(formData)}
                  disabled={createRequest.isPending || !formData.amount || !formData.justification}
                >
                  {createRequest.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Soumettre
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subventions totales</p>
                  <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(totalSubsidies)} FCFA</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisées</p>
                  <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(usedSubsidies)} FCFA</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('fr-FR').format(availableSubsidies)} FCFA</p>
                </div>
                <AlertTriangle className={`h-8 w-8 opacity-50 ${availableSubsidies < 100000 ? 'text-red-500' : 'text-green-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des demandes</CardTitle>
            <CardDescription>Liste de toutes vos demandes de subvention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : requests?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune demande de subvention</p>
                <p className="text-sm">Créez votre première demande pour obtenir des fonds MEREF.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Justification</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests?.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {request.created_at && format(new Date(request.created_at), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('fr-FR').format(request.amount)} FCFA
                      </TableCell>
                      <TableCell>{getPriorityBadge(request.priority || 'medium')}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.justification}</TableCell>
                      <TableCell>{getStatusBadge(request.status || 'pending')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SfdSubsidyRequestsPage;
