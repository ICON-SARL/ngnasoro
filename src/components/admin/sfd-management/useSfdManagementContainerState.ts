
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { useSfdData } from '../hooks/sfd-management/useSfdData';
import { useSfdAdminManagement } from '@/hooks/useSfdAdminManagement';

export function useSfdManagementContainerState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSfd, setSelectedSfd] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [showAddSfdDialog, setShowAddSfdDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [didMount, setDidMount] = useState(false);
  
  const { toast } = useToast();
  const { isLoading: isLoadingAdmin, error, addSfdAdmin } = useSfdAdminManagement();
  const queryClient = useQueryClient();
  const { sfds, isLoading, isError, refetch } = useSfdData();
  
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 2000; // 2 seconds

  // Mark component as mounted
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  // Monitor network connection status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      setIsOnline(true);
      toast({
        title: "Connection restored",
        description: "Internet connection restored. Loading data...",
      });
      handleRefreshData();
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      setIsOnline(false);
      toast({
        title: "Connection lost",
        description: "Internet connection lost. Some features may be limited.",
        variant: "destructive",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleRefreshData = useCallback(() => {
    setRetryCount(0); // Reset retry counter on manual refresh
    refetch();
    queryClient.invalidateQueries({ queryKey: ['sfds'] });
    toast({
      title: "Refreshing",
      description: "Attempting to update SFDs...",
    });
  }, [refetch, queryClient, toast]);

  // Monitor errors and perform automatic retries
  useEffect(() => {
    if (isError && retryCount < MAX_RETRIES && didMount) {
      setIsRetrying(true);
      const timer = setTimeout(() => {
        console.log(`New loading attempt (${retryCount + 1}/${MAX_RETRIES})...`);
        refetch();
        setRetryCount(prev => prev + 1);
      }, RETRY_DELAY * Math.pow(1.5, retryCount));
      
      return () => clearTimeout(timer);
    } else if (retryCount >= MAX_RETRIES && didMount) {
      setIsRetrying(false);
      // Display final message after all retry attempts
      toast({
        title: "Loading failed",
        description: "Unable to load SFDs after several attempts. Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, retryCount, refetch, toast, didMount]);

  // Set selected SFD when data is loaded
  useEffect(() => {
    if (sfds && sfds.length > 0 && !selectedSfd) {
      setSelectedSfd(sfds[0]);
    }
  }, [sfds, selectedSfd]);

  // We're limiting this effect to avoid infinite recursion
  // Removing the QueryClient subscription that seems to be causing issues
  const filteredSfds = sfds && Array.isArray(sfds) ? sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sfd.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sfd.region && sfd.region.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const handleAddAdmin = (data: any) => {
    addSfdAdmin({
      ...data,
      role: 'sfd_admin'
    });
    setShowAddAdminDialog(false);
  };

  const handleAddDialogChange = (open: boolean) => {
    setShowAddSfdDialog(open);
    if (!open) {
      // If dialog closes, refresh data
      setTimeout(() => {
        refetch();
      }, 500);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return {
    searchQuery,
    selectedSfd,
    activeTab,
    showAddAdminDialog,
    showAddSfdDialog,
    retryCount,
    isRetrying,
    isOnline,
    didMount,
    isLoadingAdmin,
    error,
    sfds: sfds || [],
    isLoading,
    isError,
    filteredSfds,
    MAX_RETRIES,
    setSelectedSfd,
    setActiveTab,
    setShowAddAdminDialog,
    setShowAddSfdDialog,
    handleAddAdmin,
    handleRefreshData,
    handleAddDialogChange,
    handleSearchChange
  };
}
