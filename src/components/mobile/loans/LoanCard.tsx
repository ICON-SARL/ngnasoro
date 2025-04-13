
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { Loan } from '@/types/sfdClients';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LoanCardProps {
  loan: Loan;
}

const getStatusData = (status: string): { label: string; icon: React.ReactNode; color: string } => {
  switch (status) {
    case 'pending':
      return { label: 'En attente', icon: <Clock className="h-4 w-4" />, color: 'bg-amber-50 text-amber-600 border-amber-200' };
    case 'approved':
      return { label: 'Approuvé', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-50 text-green-600 border-green-200' };
    case 'rejected':
      return { label: 'Rejeté', icon: <XCircle className="h-4 w-4" />, color: 'bg-red-50 text-red-600 border-red-200' };
    case 'active':
      return { label: 'Actif', icon: <CreditCard className="h-4 w-4" />, color: 'bg-blue-50 text-blue-600 border-blue-200' };
    case 'completed':
      return { label: 'Terminé', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-gray-50 text-gray-600 border-gray-200' };
    default:
      return { label: status, icon: <Clock className="h-4 w-4" />, color: 'bg-gray-50 text-gray-600 border-gray-200' };
  }
};

const LoanCard: React.FC<LoanCardProps> = ({ loan }) => {
  const navigate = useNavigate();
  const statusData = getStatusData(loan.status);
  const createdAt = new Date(loan.created_at);
  
  return (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-shadow rounded-2xl border border-gray-100 overflow-hidden" onClick={() => navigate(`/mobile-flow/loan/${loan.id}`)}>
      <div className="h-2 bg-gradient-to-r from-[#0D6A51] to-[#33C3F0]"></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-gray-800">{loan.purpose}</h3>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(createdAt, { addSuffix: true, locale: fr })}
            </p>
          </div>
          <Badge className={`flex items-center gap-1 ${statusData.color} rounded-full px-3 py-1 font-medium border shadow-sm`}>
            {statusData.icon}
            <span>{statusData.label}</span>
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Montant</p>
            <p className="font-semibold text-gray-800">{loan.amount?.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Durée</p>
            <p className="font-semibold text-gray-800">{loan.duration_months} mois</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-[#0D6A51] hover:bg-[#0D6A51]/10 rounded-full">
            Détails <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanCard;
