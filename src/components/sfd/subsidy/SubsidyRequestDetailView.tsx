
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  MapPin,
  AlertTriangle,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { SubsidyRequest } from '@/types/subsidyRequests';

interface SubsidyRequestDetailViewProps {
  request: SubsidyRequest;
}

export const SubsidyRequestDetailView: React.FC<SubsidyRequestDetailViewProps> = ({ request }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            En attente
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            En cours d'examen
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            Approuvée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" />
            Rejetée
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-gray-100">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-blue-100">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100">Urgente</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (!request) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with main information */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">{request.purpose}</h2>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Demande soumise le {formatDate(request.created_at)}</span>
          </div>
          {request.region && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Région: {request.region}</span>
            </div>
          )}
          {request.sfd_name && (
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>SFD: {request.sfd_name}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{formatAmount(request.amount)} FCFA</div>
          <div className="flex flex-wrap gap-2 justify-end mt-2">
            {getStatusBadge(request.status)}
            {getPriorityBadge(request.priority)}
            {request.alert_triggered && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Alerte
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Request details */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Justification</h3>
            <p className="bg-gray-50 p-4 rounded-md border text-sm">
              {request.justification || "Aucune justification fournie."}
            </p>
          </div>

          {request.expected_impact && (
            <div>
              <h3 className="font-medium mb-2">Impact attendu</h3>
              <p className="bg-gray-50 p-4 rounded-md border text-sm">
                {request.expected_impact}
              </p>
            </div>
          )}
        </div>

        {/* Additional information and documents */}
        <div className="space-y-4">
          {/* Supporting documents */}
          <div>
            <h3 className="font-medium mb-2">Documents justificatifs</h3>
            {request.supporting_documents && request.supporting_documents.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {request.supporting_documents.map((doc: string, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center p-2 bg-white">
                    <FileText className="h-4 w-4 mr-1" />
                    Document {index + 1}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun document attaché.</p>
            )}
          </div>

          {/* Decision and comments */}
          {request.status === 'approved' || request.status === 'rejected' ? (
            <Card>
              <CardContent className={`p-4 ${request.status === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
                {request.status === 'approved' ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Demande approuvée</p>
                      <p className="text-sm text-green-700">
                        {request.decision_comments || "Aucun commentaire fourni."}
                      </p>
                      {request.reviewed_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Approuvée le {formatDate(request.reviewed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Demande rejetée</p>
                      <p className="text-sm text-red-700">
                        {request.decision_comments || "Aucun motif fourni."}
                      </p>
                      {request.reviewed_at && (
                        <p className="text-xs text-red-600 mt-1">
                          Rejetée le {formatDate(request.reviewed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div>
              <h3 className="font-medium mb-2">Statut</h3>
              <p className="text-sm">
                {request.status === 'pending' ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    En attente de décision
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    En cours d'examen
                  </span>
                )}
              </p>
            </div>
          )}
          
          {/* Requestor information */}
          <div>
            <h3 className="font-medium mb-2">Demandeur</h3>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{request.requester_name || "Non spécifié"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
