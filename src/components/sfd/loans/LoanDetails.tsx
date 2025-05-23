import React from 'react';
import { 
  CalendarDays, 
  CheckCircle, 
  Clock, 
  Download, 
  FileText, 
  Info, 
  Loader2, 
  MoreVertical, 
  Pencil, 
  User, 
  XCircle,
  BellRing,
  QrCode,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLoan } from '@/hooks/useLoan';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Repayment {
  id: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
}

interface LoanDetailsProps {
  loan?: any;
  onClose?: () => void;
  onAction?: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
};

const LoanDetails: React.FC<LoanDetailsProps> = ({ loan: propLoan, onClose, onAction }) => {
  const { loanId } = useParams<{ loanId: string }>();
  const navigate = useNavigate();
  
  const { loan: hookLoan, isLoading } = useLoan(propLoan ? '' : (loanId as string));
  
  const loan = propLoan || hookLoan;

  const repaymentHistory: Repayment[] = [
    {
      id: '1',
      date: '2024-03-01',
      amount: 10000,
      status: 'paid',
    },
    {
      id: '2',
      date: '2024-04-01',
      amount: 10000,
      status: 'paid',
    },
    {
      id: '3',
      date: '2024-05-01',
      amount: 10000,
      status: 'pending',
    },
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement...</CardTitle>
          <CardDescription>Récupération des détails du prêt</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </CardContent>
      </Card>
    );
  }

  if (!loan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prêt non trouvé</CardTitle>
          <CardDescription>Le prêt demandé n'existe pas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Détails du prêt
          </CardTitle>
          <CardDescription>
            Informations générales sur le prêt
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="Client" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{loan.client_name}</p>
              {loan.sfd_clients?.email && (
                <p className="text-sm text-muted-foreground">
                  {loan.sfd_clients.email}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">
              {formatCurrency(loan.amount)}
            </h2>
            <p className="text-sm text-muted-foreground">
              Prêt accordé le {new Date(loan.created_at).toLocaleDateString()}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Taux d'intérêt</p>
              <p className="text-lg">{loan.interest_rate}%</p>
            </div>
            <div>
              <p className="text-sm font-medium">Durée</p>
              <p className="text-lg">{loan.duration} mois</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Badge variant="secondary">{loan.status}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/sfd-loans/edit/${loanId}`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <XCircle className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="h-5 w-5 mr-2" />
            Paiements et remboursements
          </CardTitle>
          <CardDescription>
            Options de paiement et suivi des remboursements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Options de remboursement</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Permettez à vos clients d'effectuer des remboursements via différentes méthodes de paiement.
              </p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-between"
                  onClick={() => navigate(`/sfd-loans/${loanId}/payment/qr-code`)}
                >
                  <div className="flex items-center">
                    <QrCode className="h-4 w-4 mr-2" />
                    <span>Générer un code QR</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-between"
                  onClick={() => navigate(`/sfd-loans/${loanId}/payment/mobile-money`)}
                >
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    <span>Paiement Mobile Money</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Statut des paiements</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prochain paiement:</span>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    {loan.next_payment_date 
                      ? new Date(loan.next_payment_date).toLocaleDateString()
                      : "Non défini"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Montant mensuel:</span>
                  <span className="font-semibold">{formatCurrency(loan.monthly_payment || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dernier paiement:</span>
                  <span>
                    {loan.last_payment_date 
                      ? new Date(loan.last_payment_date).toLocaleDateString()
                      : "Aucun"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {repaymentHistory && Array.isArray(repaymentHistory) && repaymentHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repaymentHistory.map((repayment) => (
                  <TableRow key={repayment.id}>
                    <TableCell>{new Date(repayment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(repayment.amount)}</TableCell>
                    <TableCell>
                      {repayment.status === 'paid' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Payé
                        </Badge>
                      ) : repayment.status === 'pending' ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-4 w-4 mr-2" />
                          En attente
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          <XCircle className="h-4 w-4 mr-2" />
                          Échoué
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <BellRing className="h-4 w-4 mr-2" />
                        Notifier
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <div className="text-center p-4">Aucun remboursement trouvé.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanDetails;
