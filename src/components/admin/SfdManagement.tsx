
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Eye, MoreHorizontal, Pencil, Shield, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type Sfd = {
  id: string;
  name: string;
  code: string;
  region?: string;
  logo_url?: string;
  created_at: string;
  status?: 'active' | 'suspended' | 'pending';
};

export function SfdManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSfd, setSelectedSfd] = useState<Sfd | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);

  // Fetch SFDs from Supabase
  const { data: sfds, isLoading, isError } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Sfd[];
    },
  });

  // Mutation to suspend a SFD
  const suspendSfdMutation = useMutation({
    mutationFn: async (sfdId: string) => {
      const { data, error } = await supabase
        .from('sfds')
        .update({ status: 'suspended' })
        .eq('id', sfdId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD suspendu',
        description: `Le compte SFD a été suspendu avec succès.`,
      });
      setShowSuspendDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation to reactivate a SFD
  const reactivateSfdMutation = useMutation({
    mutationFn: async (sfdId: string) => {
      const { data, error } = await supabase
        .from('sfds')
        .update({ status: 'active' })
        .eq('id', sfdId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD réactivé',
        description: `Le compte SFD a été réactivé avec succès.`,
      });
      setShowReactivateDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleSuspendSfd = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowSuspendDialog(true);
  };

  const handleReactivateSfd = (sfd: Sfd) => {
    setSelectedSfd(sfd);
    setShowReactivateDialog(true);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Une erreur est survenue lors de la récupération des SFDs.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Liste des SFDs ({sfds?.length || 0})
      </h2>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Région</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sfds?.map((sfd) => (
              <TableRow key={sfd.id}>
                <TableCell>
                  {sfd.logo_url ? (
                    <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      <img src={sfd.logo_url} alt={sfd.name} className="h-10 w-10 object-cover" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{sfd.name}</TableCell>
                <TableCell>{sfd.code}</TableCell>
                <TableCell>{sfd.region || '-'}</TableCell>
                <TableCell>
                  {!sfd.status || sfd.status === 'active' ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                      Actif
                    </Badge>
                  ) : sfd.status === 'suspended' ? (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                      Suspendu
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                      En attente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => {}}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Voir les détails</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Modifier</span>
                      </DropdownMenuItem>
                      {(!sfd.status || sfd.status === 'active') ? (
                        <DropdownMenuItem 
                          onClick={() => handleSuspendSfd(sfd)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          <span>Suspendre</span>
                        </DropdownMenuItem>
                      ) : sfd.status === 'suspended' ? (
                        <DropdownMenuItem 
                          onClick={() => handleReactivateSfd(sfd)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          <span>Réactiver</span>
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Suspend SFD Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre le compte SFD</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir suspendre le compte SFD "{selectedSfd?.name}"? Cette action empêchera l'accès à la plateforme.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => selectedSfd && suspendSfdMutation.mutate(selectedSfd.id)}
              disabled={suspendSfdMutation.isPending}
            >
              {suspendSfdMutation.isPending ? 'En cours...' : 'Suspendre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate SFD Dialog */}
      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réactiver le compte SFD</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir réactiver le compte SFD "{selectedSfd?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button 
              variant="default" 
              onClick={() => selectedSfd && reactivateSfdMutation.mutate(selectedSfd.id)}
              disabled={reactivateSfdMutation.isPending}
            >
              {reactivateSfdMutation.isPending ? 'En cours...' : 'Réactiver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
