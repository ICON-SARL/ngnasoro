
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, Banknote, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoanCardProps {
  loan: Loan;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan }) => {
  const navigate = useNavigate();
  
  // Format date
  const createdDate = new Date(loan.created_at);
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true, locale: fr });
  
  // Format amount
  const formattedAmount = new Intl.NumberFormat('fr-FR').format(loan.amount);
  
  // Status badge style and icon
  const getBadgeProps = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          variant: "outline" as const, 
          className: "bg-amber-50 text-amber-600 border-amber-200",
          label: "En attente",
          icon: <Clock className="h-3.5 w-3.5 mr-1.5" />
        };
      case 'approved':
      case 'active':
        return { 
          variant: "outline" as const, 
          className: "bg-green-50 text-green-600 border-green-200",
          label: "Approuvé",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
        };
      case 'rejected':
        return { 
          variant: "outline" as const, 
          className: "bg-red-50 text-red-600 border-red-200",
          label: "Rejeté",
          icon: <XCircle className="h-3.5 w-3.5 mr-1.5" />
        };
      case 'completed':
        return { 
          variant: "outline" as const, 
          className: "bg-blue-50 text-blue-600 border-blue-200",
          label: "Terminé",
          icon: <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
        };
      default:
        return { 
          variant: "outline" as const, 
          className: "bg-gray-50 text-gray-600 border-gray-200",
          label: status,
          icon: <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
        };
    }
  };
  
  const badgeProps = getBadgeProps(loan.status);
  
  return (
    <Card className="mb-3 overflow-hidden border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-gray-900">{loan.purpose}</h3>
            <p className="text-xs text-gray-500">{relativeTime}</p>
          </div>
          <Badge variant={badgeProps.variant} className={badgeProps.className}>
            <span className="flex items-center">
              {badgeProps.icon}
              {badgeProps.label}
            </span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-sm">
            <Banknote className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Montant</p>
              <p className="font-medium">{formattedAmount} FCFA</p>
            </div>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Durée</p>
              <p className="font-medium">{loan.duration_months} mois</p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full text-sm border-gray-200 mt-2"
          onClick={() => navigate(`/loans/details/${loan.id}`)}
        >
          Voir les détails
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoanCard;
