
import React, { useState } from 'react';
import { SfdClient } from '@/types/sfdClients';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Shield,
  Wallet,
  Plus,
  Trash2
} from 'lucide-react';
import { useClientAccountOperations } from '@/components/admin/hooks/sfd-client/useClientAccountOperations';
import { useAuth } from '@/hooks/useAuth';

interface ClientDetailsProps {
  client: SfdClient;
  onDeleted?: () => void;
}

const ClientDetails = ({ client, onDeleted }: ClientDetailsProps) => {
  const { isSfdAdmin } = useAuth();
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [creditDescription, setCreditDescription] = useState<string>('');
  
  const {
    balance,
    currency,
    isLoading: isBalanceLoading,
    creditAccount,
    deleteAccount,
    refetchBalance
  } = useClientAccountOperations(client.id);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'validated':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700">En attente</Badge>;
      case 'validated':
        return <Badge className="bg-green-50 text-green-700">Validé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-700">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  const getKycLevel = (level: number) => {
    switch(level) {
      case 0:
        return "Non vérifié";
      case 1:
        return "Basique";
      case 2:
        return "Intermédiaire";
      case 3:
        return "Complet";
      default:
        return "Inconnu";
    }
  };

  const handleCreditAccount = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) return;
    
    await creditAccount.mutateAsync({
      amount: parseFloat(creditAmount),
      description: creditDescription
    });
    
    setCreditAmount('');
    setCreditDescription('');
    setIsCreditDialogOpen(false);
  };

  const handleDeleteAccount = async () => {
    await deleteAccount.mutateAsync();
    if (onDeleted) onDeleted();
  };
  
  return (
    <div className="space-y-4 py-4">
      {isSfdAdmin && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-lg font-medium mr-2">Actions client</h3>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isCreditDialogOpen} onOpenChange={setIsCreditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-[#0D6A51] border-[#0D6A51] hover:bg-[#0D6A51]/10">
                  <Plus className="h-4 w-4 mr-1" />
                  Créditer le compte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créditer le compte client</DialogTitle>
                  <DialogDescription>
                    Ajoutez des fonds au compte du client {client.full_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Montant
                    </Label>
                    <div className="col-span-3 relative">
                      <Input
                        id="amount"
                        type="number"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        className="pr-16"
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        {currency}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={creditDescription}
                      onChange={(e) => setCreditDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="Raison du crédit (optionnel)"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreditDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreditAccount} 
                    disabled={!creditAmount || parseFloat(creditAmount) <= 0 || creditAccount.isPending}
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                  >
                    {creditAccount.isPending ? 'Traitement en cours...' : 'Créditer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer le compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce compte ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes les données du client {client.full_name} seront définitivement supprimées.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {deleteAccount.isPending ? 'Suppression...' : 'Supprimer définitivement'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <User className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Informations personnelles
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium">Nom complet</div>
                <div>{client.full_name}</div>
              </div>
              
              {client.email && (
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{client.email}</span>
                  </div>
                </div>
              )}
              
              {client.phone && (
                <div>
                  <div className="text-sm font-medium">Téléphone</div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{client.phone}</span>
                  </div>
                </div>
              )}
              
              {client.address && (
                <div>
                  <div className="text-sm font-medium">Adresse</div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{client.address}</span>
                  </div>
                </div>
              )}
              
              {client.id_type && client.id_number && (
                <div>
                  <div className="text-sm font-medium">Pièce d'identité</div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-1 text-gray-500" />
                    <span>
                      {client.id_type}: {client.id_number}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-[#0D6A51]" />
              Statut du compte
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Statut actuel</div>
                <div>{getStatusBadge(client.status)}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium">Niveau KYC</div>
                <div>{getKycLevel(client.kyc_level)}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium">Date de création</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span>{new Date(client.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {client.validated_at && (
                <div>
                  <div className="text-sm font-medium">
                    {client.status === 'validated' ? 'Date de validation' : 'Date de rejet'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{new Date(client.validated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {isSfdAdmin && client.status === 'validated' && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Solde du compte
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => refetchBalance()}
                disabled={isBalanceLoading}
              >
                <RefreshIcon className="h-4 w-4" />
              </Button>
            </h3>
            
            <div>
              {isBalanceLoading ? (
                <div className="flex items-center justify-center h-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0D6A51]"></div>
                </div>
              ) : (
                <div className="text-2xl font-semibold text-center py-2">
                  {new Intl.NumberFormat('fr-FR').format(balance)} {currency}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {client.notes && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Notes</h3>
            <p className="text-sm text-gray-700">{client.notes}</p>
          </CardContent>
        </Card>
      )}
      
      {client.status !== 'pending' && (
        <div className={`p-4 rounded-md flex items-start space-x-3 ${
          client.status === 'validated' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {getStatusIcon(client.status)}
          <div>
            <h3 className={`font-medium ${
              client.status === 'validated' ? 'text-green-800' : 'text-red-800'
            }`}>
              {client.status === 'validated' ? 'Compte validé' : 'Compte rejeté'}
            </h3>
            <p className={`text-sm mt-1 ${
              client.status === 'validated' ? 'text-green-700' : 'text-red-700'
            }`}>
              {client.status === 'validated' 
                ? "Ce client a été validé et a accès aux services financiers de votre SFD." 
                : "Ce client a été rejeté et n'a pas accès aux services financiers de votre SFD."
              }
              {client.validated_at && (
                <> Le {new Date(client.validated_at).toLocaleDateString()}</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Icône de rafraîchissement
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M3 21v-5h5"></path>
  </svg>
);

export default ClientDetails;
