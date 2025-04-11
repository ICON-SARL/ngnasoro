
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "./errorHandler";
import { sfdApi } from "./api/modules/sfdApi";
import { profileApi } from "./api/modules/profileApi";
import { transactionApi } from "./api/modules/transactionApi";
import { storageApi } from "./api/modules/storageApi";
import { edgeFunctionApi } from "./api/modules/edgeFunctionApi";
import { dashboardApi } from "./api/modules/dashboardApi";
import { adminCommunicationApi } from "./api/modules/adminCommunicationApi";
import { sfdClientApi } from "./api/modules/sfdClientApi";

// Main API client facade that exposes all modules
export const apiClient = {
  // Expose supabase for direct use
  supabase,
  
  // SFD operations
  getSfdsList: sfdApi.getSfdsList,
  getUserSfds: sfdApi.getUserSfds,
  getSfdClientStatus: sfdApi.getSfdClientStatus,
  getSfdBalance: sfdApi.getSfdBalance,
  getSfdLoans: sfdApi.getSfdLoans,
  getMerefDashboardStats: sfdApi.getMerefDashboardStats,
  synchronizeAccounts: sfdApi.synchronizeAccounts,
  createSfdWithAdmin: sfdApi.createSfdWithAdmin,
  createSfdSubsidy: sfdApi.createSfdSubsidy,
  
  // SFD Client Account operations
  getClientAccount: sfdClientApi.getClientAccount,
  createClientAccount: sfdClientApi.createClientAccount,
  processDeposit: sfdClientApi.processDeposit,
  processWithdrawal: sfdClientApi.processWithdrawal,
  processLoanDisbursement: sfdClientApi.processLoanDisbursement,
  processMobileMoneyTransaction: sfdClientApi.processMobileMoneyTransaction,
  generateTransactionQRCode: sfdClientApi.generateTransactionQRCode,
  processQRCodeTransaction: sfdClientApi.processQRCodeTransaction,
  
  // User profile operations
  getUserProfile: profileApi.getUserProfile,
  updateUserProfile: profileApi.updateUserProfile,
  
  // Transaction operations
  getUserTransactions: transactionApi.getUserTransactions,
  
  // Edge functions
  callEdgeFunction: edgeFunctionApi.callEdgeFunction,
  
  // Dashboard operations
  getDashboardData: dashboardApi.getDashboardData,
  refreshDashboardData: dashboardApi.refreshDashboardData,
  
  // Storage operations
  uploadFile: storageApi.uploadFile,
  getFileUrl: storageApi.getFileUrl
};
