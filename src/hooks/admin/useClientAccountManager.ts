
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/utils/apiClient';
import { SfdClientAccount } from '@/utils/api/modules/sfdClientApi';

export function useClientAccountManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Create a client account if it doesn't exist
  const createClientAccount = async (clientId: string, sfdId: string, initialBalance: number = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const account = await apiClient.createClientAccount(clientId, sfdId, initialBalance);
      
      if (account) {
        toast({
          title: "Compte créé",
          description: "Le compte client a été créé avec succès",
        });
        return account;
      } else {
        throw new Error("Échec de création du compte");
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la création du compte");
      toast({
        title: "Erreur",
        description: error.message || "Échec de création du compte client",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Process a deposit transaction
  const makeDeposit = async (
    clientId: string, 
    amount: number, 
    adminId: string,
    description?: string,
    paymentMethod: string = 'cash'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.processDeposit(clientId, amount, adminId, description, paymentMethod);
      
      if (result.success) {
        toast({
          title: "Dépôt effectué",
          description: `${amount} FCFA ont été déposés sur le compte du client`,
        });
        return result;
      } else {
        throw new Error(result.error || "Échec du dépôt");
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors du dépôt");
      toast({
        title: "Erreur",
        description: error.message || "Échec du dépôt sur le compte client",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Process a withdrawal transaction
  const makeWithdrawal = async (
    clientId: string, 
    amount: number, 
    adminId: string,
    description?: string,
    paymentMethod: string = 'cash'
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.processWithdrawal(clientId, amount, adminId, description, paymentMethod);
      
      if (result.success) {
        toast({
          title: "Retrait effectué",
          description: `${amount} FCFA ont été retirés du compte du client`,
        });
        return result;
      } else {
        throw new Error(result.error || "Échec du retrait");
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors du retrait");
      toast({
        title: "Erreur",
        description: error.message || "Échec du retrait du compte client",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Disburse loan to client account
  const disburseLoan = async (
    clientId: string,
    loanId: string,
    amount: number,
    adminId: string,
    description?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.processLoanDisbursement(clientId, loanId, amount, adminId, description);
      
      if (result.success) {
        toast({
          title: "Prêt décaissé",
          description: `${amount} FCFA ont été crédités sur le compte du client`,
        });
        return result;
      } else {
        throw new Error(result.error || "Échec du décaissement");
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors du décaissement");
      toast({
        title: "Erreur",
        description: error.message || "Échec du décaissement du prêt",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Process mobile money transaction
  const processMobileMoneyTransaction = async (
    clientId: string,
    amount: number,
    phoneNumber: string,
    provider: string,
    transactionType: 'deposit' | 'withdrawal',
    adminId: string,
    description?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.processMobileMoneyTransaction(
        clientId,
        amount,
        phoneNumber,
        provider,
        transactionType,
        adminId,
        description
      );
      
      if (result.success) {
        toast({
          title: transactionType === 'deposit' ? "Dépôt effectué" : "Retrait effectué",
          description: `Opération Mobile Money de ${amount} FCFA ${transactionType === 'deposit' ? 'vers' : 'depuis'} le compte client`,
        });
        return result;
      } else {
        throw new Error(result.error || `Échec de l'opération Mobile Money`);
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de l'opération Mobile Money");
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'opération Mobile Money",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR code for in-agency transaction
  const generateTransactionQRCode = async (
    clientId: string,
    amount: number,
    transactionType: 'deposit' | 'withdrawal',
    adminId: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.generateTransactionQRCode(
        clientId,
        amount,
        transactionType,
        adminId
      );
      
      if (result.success) {
        toast({
          title: "QR Code généré",
          description: `QR Code généré pour ${transactionType === 'deposit' ? 'dépôt' : 'retrait'} de ${amount} FCFA`,
        });
        return result;
      } else {
        throw new Error(result.error || "Échec de génération du QR Code");
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la génération du QR Code");
      toast({
        title: "Erreur",
        description: error.message || "Échec de génération du QR Code",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Process a transaction with QR code verification
  const processQRCodeTransaction = async (
    qrCodeData: string,
    adminId: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.processQRCodeTransaction(qrCodeData, adminId);
      
      if (result.success) {
        toast({
          title: "Transaction effectuée",
          description: "Transaction par QR Code traitée avec succès",
        });
        return result;
      } else {
        throw new Error(result.error || "Échec de la transaction par QR Code");
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la transaction par QR Code");
      toast({
        title: "Erreur",
        description: error.message || "Échec de la transaction par QR Code",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createClientAccount,
    makeDeposit,
    makeWithdrawal,
    disburseLoan,
    processMobileMoneyTransaction,
    generateTransactionQRCode,
    processQRCodeTransaction
  };
}
