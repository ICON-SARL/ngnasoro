
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock, XCircle, UploadCloud, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { mobileApi } from '@/utils/mobileApi';

interface LoanStatus {
  id: string;
  status: 'submitted' | 'verifying' | 'approved' | 'rejected' | 'active';
  amount: number;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  disbursed_at?: string;
  sfd_name: string;
  purpose: string;
  details?: {
    rejection_reason?: string;
    comments?: string;
  };
}

const getLoanStatusStep = (status: LoanStatus['status']) => {
  switch(status) {
    case 'submitted': return 1;
    case 'verifying': return 2;
    case 'approved': case 'active': return 3;
    case 'rejected': return 3;
    default: return 1;
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const LoanTrackingPage: React.FC = () => {
  const [loan, setLoan] = useState<LoanStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        if (!loanId) {
          toast({
            title: 'Erreur',
            description: 'Identifiant de prêt manquant',
            variant: 'destructive',
          });
          navigate('/mobile-flow/loan-activity');
          return;
        }
        
        // Simulation de chargement des données de prêt
        // Dans une application réelle, utilisez l'API pour récupérer les données
        setLoading(true);
        
        // Cette simulation sera remplacée par un appel API réel
        setTimeout(() => {
          // Données d'exemple
          const mockLoan: LoanStatus = {
            id: loanId,
            status: 'verifying',
            amount: 250000,
            created_at: new Date().toISOString(),
            sfd_name: 'Microfinance Alpha',
            purpose: 'Financement d\'un projet agricole'
          };
          
          setLoan(mockLoan);
          setLoading(false);
        }, 1000);
        
        // Quand l'API sera implémentée, on utilisera:
        // const userLoans = await mobileApi.getUserLoans();
        // const loanDetails = userLoans.find(loan => loan.id === loanId);
        // setLoan(loanDetails || null);
        
      } catch (error) {
        console.error('Erreur lors du chargement des détails du prêt:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails du prêt',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [loanId, navigate]);

  const handleBack = () => {
    navigate('/mobile-flow/loan-activity');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <div className="text-center py-8">
          <div className="text-xl font-bold mb-2">Prêt introuvable</div>
          <p className="text-gray-500 mb-4">Les détails de ce prêt ne sont pas disponibles.</p>
          <Button onClick={handleBack}>Retour aux prêts</Button>
        </div>
      </div>
    );
  }

  const statusStep = getLoanStatusStep(loan.status);
  const totalSteps = 3;
  const progressPercentage = (statusStep / totalSteps) * 100;

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4" 
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <h1 className="text-2xl font-bold mb-6">Suivi de ma demande</h1>
      
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">Demande n°{loan.id.substring(0, 8)}</h2>
          <span className={`px-2 py-1 rounded-full text-xs ${
            loan.status === 'approved' || loan.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : loan.status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {loan.status === 'submitted' && 'Soumise'}
            {loan.status === 'verifying' && 'En vérification'}
            {loan.status === 'approved' && 'Approuvée'}
            {loan.status === 'active' && 'Active'}
            {loan.status === 'rejected' && 'Rejetée'}
          </span>
        </div>
        
        <div className="text-sm text-gray-500 flex items-center mb-4">
          <Calendar className="h-4 w-4 mr-1" /> 
          <span>Soumise le {formatDate(loan.created_at)}</span>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium mb-1 flex justify-between">
            <span>Progression</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="bg-green-100 p-1.5 rounded-full mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Demande soumise</h3>
              <p className="text-sm text-gray-500">{formatDate(loan.created_at)}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`${
              statusStep >= 2 ? 'bg-blue-100' : 'bg-gray-100'
            } p-1.5 rounded-full mr-3`}>
              <Clock className={`h-5 w-5 ${
                statusStep >= 2 ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className={`font-medium ${statusStep < 2 ? 'text-gray-400' : ''}`}>
                Vérification
              </h3>
              <p className="text-sm text-gray-500">
                {statusStep >= 2 ? 'En cours de traitement' : 'En attente'}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className={`${
              statusStep >= 3 
                ? loan.status === 'rejected' 
                  ? 'bg-red-100' 
                  : 'bg-green-100'
                : 'bg-gray-100'
            } p-1.5 rounded-full mr-3`}>
              {statusStep >= 3 ? (
                loan.status === 'rejected' 
                  ? <XCircle className="h-5 w-5 text-red-600" />
                  : <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className={`font-medium ${statusStep < 3 ? 'text-gray-400' : ''}`}>
                {loan.status === 'rejected' ? 'Décision (Rejetée)' : 'Décision (Approuvée)'}
              </h3>
              <p className="text-sm text-gray-500">
                {statusStep < 3 
                  ? 'En attente' 
                  : loan.status === 'rejected' 
                    ? formatDate(loan.rejected_at) 
                    : formatDate(loan.approved_at)}
              </p>
              {loan.status === 'rejected' && loan.details?.rejection_reason && (
                <p className="text-sm text-red-600 mt-1">
                  Motif: {loan.details.rejection_reason}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Détails de la demande</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Montant</span>
            <span className="font-medium">{loan.amount.toLocaleString()} FCFA</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Institution</span>
            <span className="font-medium">{loan.sfd_name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Objet</span>
            <span className="font-medium">{loan.purpose}</span>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Documents soumis</h2>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 border rounded-lg">
            <div className="flex items-center">
              <div className="bg-gray-100 p-1.5 rounded">
                <UploadCloud className="h-4 w-4 text-gray-500" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">Pièce d'identité</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-2 border rounded-lg">
            <div className="flex items-center">
              <div className="bg-gray-100 p-1.5 rounded">
                <UploadCloud className="h-4 w-4 text-gray-500" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium">Justificatif de revenus</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={handleBack}
      >
        Retour à la liste des prêts
      </Button>
    </div>
  );
};

export default LoanTrackingPage;
