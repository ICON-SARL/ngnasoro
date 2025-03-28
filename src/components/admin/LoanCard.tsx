
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ImageOptimizer } from '@/utils/imageOptimization';

interface LoanCardProps {
  loan: any;
  onApprove: (loan: any) => void;
  onReject: (loan: any) => void;
  showActions: boolean;
}

export const LoanCard: React.FC<LoanCardProps> = ({ loan, onApprove, onReject, showActions }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  React.useEffect(() => {
    // Précharger l'image client si disponible
    if (loan.client?.avatar_url) {
      ImageOptimizer.preloadImage(loan.client.avatar_url)
        .then(() => setImageLoaded(true))
        .catch(() => setImageLoaded(false));
    }
  }, [loan.client?.avatar_url]);
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">En attente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: fr });
  };
  
  const timeAgo = (dateString: string) => {
    if (!dateString) return '';
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true, locale: fr });
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-lg">{loan.amount?.toLocaleString()} FCFA</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>Créé {timeAgo(loan.created_at)}</span>
              </div>
            </div>
            {getStatusBadge(loan.status)}
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Client</p>
              <p className="font-medium">{loan.client?.full_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Durée</p>
              <p className="font-medium">{loan.duration_months} mois</p>
            </div>
            <div>
              <p className="text-muted-foreground">Taux d'intérêt</p>
              <p className="font-medium">{loan.interest_rate}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mensualité</p>
              <p className="font-medium">{loan.monthly_payment?.toLocaleString() || 'N/A'} FCFA</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Objet</p>
              <p className="font-medium truncate">{loan.purpose}</p>
            </div>
          </div>
          
          {loan.status === 'approved' && (
            <div className="mt-3 text-sm">
              <p className="text-muted-foreground">Date d'approbation</p>
              <p className="font-medium">{formatDate(loan.approved_at || '')}</p>
            </div>
          )}
          
          {showActions && (
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onReject(loan)}
              >
                Rejeter
              </Button>
              <Button 
                size="sm"
                onClick={() => onApprove(loan)}
              >
                Approuver
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
