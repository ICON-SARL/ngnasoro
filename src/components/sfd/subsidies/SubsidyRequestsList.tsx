
import React from 'react';
import { useSubsidyRequests } from '@/hooks/useSubsidyRequests';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, AlertCircle, Clock, CheckCircle, XCircle, CalendarIcon } from 'lucide-react';
import { SubsidyRequest } from '@/types/subsidyRequests';

interface SubsidyRequestsListProps {
  sfdId: string;
  onViewDetails: (requestId: string) => void;
}

const SubsidyRequestsList: React.FC<SubsidyRequestsListProps> = ({ sfdId, onViewDetails }) => {
  const { subsidyRequests, isLoading, isError } = useSubsidyRequests({ sfdId });
  
  const renderStatusBadge = (status: SubsidyRequest['status']) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" /> En cours d'examen</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Approuvée</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Rejetée</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };
  
  const renderPriorityBadge = (priority: SubsidyRequest['priority']) => {
    switch(priority) {
      case 'low':
        return <Badge variant="outline" className="border-gray-300 text-gray-700">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="border-red-300 text-red-700">Urgente</Badge>;
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <div className="h-8 w-8 mx-auto mb-4 rounded-full border-2 border-t-[#0D6A51] animate-spin" />
          <p className="text-sm text-gray-500">Chargement des demandes...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <h3 className="font-medium">Erreur de chargement</h3>
            <p className="text-sm text-gray-500">
              Une erreur est survenue lors du chargement des demandes. Veuillez réessayer.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (subsidyRequests.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="font-medium">Aucune demande</h3>
            <p className="text-sm text-gray-500">
              Vous n'avez pas encore soumis de demande de prêt MEREF.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vos demandes de prêt MEREF</CardTitle>
        <CardDescription>Suivez l'état de vos demandes de prêt auprès du MEREF</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subsidyRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell><strong>{request.amount.toLocaleString()} FCFA</strong></TableCell>
                <TableCell>
                  {request.purpose === 'agriculture' && 'Agriculture'}
                  {request.purpose === 'women_empowerment' && 'Autonomisation des femmes'}
                  {request.purpose === 'youth_employment' && 'Emploi des jeunes'}
                  {request.purpose === 'small_business' && 'Petites entreprises'}
                  {request.purpose === 'microfinance' && 'Expansion des activités de microfinance'}
                  {request.purpose === 'other' && 'Autre'}
                </TableCell>
                <TableCell>{renderPriorityBadge(request.priority)}</TableCell>
                <TableCell>{renderStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDetails(request.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubsidyRequestsList;
