
import React, { useState, useEffect } from 'react';
import { SfdHeader } from '@/components/SfdHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SfdNavigation } from '@/components/sfd/SfdNavigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, FileText, RefreshCw, Filter, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTransactions } from '@/hooks/transactions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TransactionFilters } from '@/services/transactions/types';
import { TransactionSecurityDialog } from '@/components/sfd/transactions/TransactionSecurityDialog';
import { transactionService } from '@/services/transactions/transactionService';

const SfdTransactionsPage: React.FC = () => {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  
  const { 
    transactions, 
    isLoading, 
    refetch
  } = useTransactions(user?.id, activeSfdId, filters);

  useEffect(() => {
    if (activeSfdId) {
      refetch();
    }
  }, [activeSfdId, refetch]);

  const handleGenerateReceipt = async (transactionId: string) => {
    try {
      setIsGeneratingReceipt(true);
      setSelectedTransactionId(transactionId);
      
      const receipt = await transactionService.getTransactionReceipt(transactionId);
      
      toast({
        title: "Reçu généré",
        description: "Le reçu de transaction a été généré avec succès",
      });
      
      // In a real app, we would download the PDF here
      console.log('Receipt URL:', receipt.url);
      
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le reçu",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReceipt(false);
      setSelectedTransactionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SfdHeader />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Transactions</h2>
          <p className="text-muted-foreground">
            Suivez toutes les transactions de votre SFD avec sécurité et transparence
          </p>
        </div>
        
        <div className="mb-6">
          <SfdNavigation />
        </div>
        
        <Alert className="mb-6 border-amber-400 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <AlertTitle className="text-amber-700">Transactions Sécurisées</AlertTitle>
          <AlertDescription className="text-amber-700">
            Toutes les transactions sont traitées de manière atomique avec rollback automatique en cas d'échec.
            Les journaux d'audit sont chiffrés et les reçus sont générés automatiquement.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          
          <div className="flex gap-2">
            <Button onClick={() => setIsSecurityDialogOpen(true)} variant="outline" size="sm">
              <Shield className="h-4 w-4 mr-2" />
              Paramètres de sécurité
            </Button>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="deposit">Dépôts</TabsTrigger>
            <TabsTrigger value="withdrawal">Retraits</TabsTrigger>
            <TabsTrigger value="transfer">Transferts</TabsTrigger>
            <TabsTrigger value="loan_related">Prêts</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle>Historique des Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune transaction trouvée
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Référence</th>
                          <th className="text-left py-2 px-4">Type</th>
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Montant</th>
                          <th className="text-left py-2 px-4">Statut</th>
                          <th className="text-right py-2 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions
                          .filter(tx => {
                            if (activeTab === 'all') return true;
                            if (activeTab === 'loan_related') {
                              return tx.type === 'loan_repayment' || tx.type === 'loan_disbursement';
                            }
                            return tx.type === activeTab;
                          })
                          .map(transaction => (
                            <tr key={transaction.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                {transaction.reference_id || 
                                  (typeof transaction.id === 'string' 
                                    ? transaction.id.substring(0, 8) 
                                    : String(transaction.id))}
                              </td>
                              <td className="py-3 px-4 capitalize">
                                {transaction.type.replace('_', ' ')}
                              </td>
                              <td className="py-3 px-4">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 font-medium">
                                {Math.abs(transaction.amount).toLocaleString()} FCFA
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  transaction.status === 'success' ? 'bg-green-100 text-green-800' :
                                  transaction.status === 'failed' ? 'bg-red-100 text-red-800' :
                                  transaction.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                  transaction.status === 'reversed' ? 'bg-amber-100 text-amber-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {transaction.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGenerateReceipt(String(transaction.id))}
                                  disabled={isGeneratingReceipt && selectedTransactionId === String(transaction.id)}
                                >
                                  {isGeneratingReceipt && selectedTransactionId === String(transaction.id) ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2" />
                                  ) : (
                                    <FileText className="h-4 w-4 mr-2" />
                                  )}
                                  Reçu
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {isSecurityDialogOpen && (
        <TransactionSecurityDialog
          isOpen={isSecurityDialogOpen}
          onClose={() => setIsSecurityDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default SfdTransactionsPage;
