
import { supabase } from "@/integrations/supabase/client";
import { handleError, handleApiResponse } from "./errorHandler";
import { sfdApi } from "./api/modules/sfdApi";
import { profileApi } from "./api/modules/profileApi";
import { transactionApi } from "./api/modules/transactionApi";
import { storageApi } from "./api/modules/storageApi";
import { edgeFunctionApi } from "./api/modules/edgeFunctionApi";
import { dashboardApi } from "./api/modules/dashboardApi";

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
