
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
  const RETRY_DELAY = 2000; // 2 secondes

  // Mark component as mounted
  useEffect(() => {
    setDidMount(true);
    return () => setDidMount(false);
  }, []);

  // Monitor network connection status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connexion réseau rétablie');
      setIsOnline(true);
      toast({
        title: "Connexion rétablie",
        description: "Connexion internet rétablie. Chargement des données...",
      });
      handleRefreshData();
    };

    const handleOffline = () => {
      console.log('Connexion réseau perdue');
      setIsOnline(false);
      toast({
        title: "Connexion perdue",
        description: "Connexion internet perdue. Certaines fonctionnalités peuvent être limitées.",
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

  // Monitor errors and perform automatic retries
  useEffect(() => {
    if (isError && retryCount < MAX_RETRIES && didMount) {
      setIsRetrying(true);
      const timer = setTimeout(() => {
        console.log(`Nouvelle tentative de chargement (${retryCount + 1}/${MAX_RETRIES})...`);
        refetch();
        setRetryCount(prev => prev + 1);
      }, RETRY_DELAY * Math.pow(1.5, retryCount));
      
      return () => clearTimeout(timer);
    } else if (retryCount >= MAX_RETRIES && didMount) {
      setIsRetrying(false);
      // Display final message after all retry attempts
      toast({
        title: "Échec du chargement",
        description: "Impossible de charger les SFDs après plusieurs tentatives. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    }
  }, [isError, retryCount, refetch, toast, didMount]);

  // Set selected SFD when data is loaded
  useEffect(() => {
    if (sfds.length > 0 && !selectedSfd) {
      setSelectedSfd(sfds[0]);
    }
  }, [sfds, selectedSfd]);

  // Listen for events to detect changes in the QueryClient
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      console.log("Cache de requêtes modifié, rafraîchissement des SFDs...");
      if (didMount) {
        refetch();
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [queryClient, refetch, didMount]);

  const filteredSfds = sfds.filter(sfd => 
    sfd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sfd.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (sfd.region && sfd.region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddAdmin = (data: any) => {
    addSfdAdmin({
      ...data,
      role: 'sfd_admin'
    });
    setShowAddAdminDialog(false);
  };

  const handleRefreshData = useCallback(() => {
    setRetryCount(0); // Reset retry counter on manual refresh
    refetch();
    queryClient.invalidateQueries({ queryKey: ['sfds'] });
    toast({
      title: "Rafraîchissement",
      description: "Tentative de mise à jour des SFDs...",
    });
  }, [refetch, queryClient, toast]);

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
    sfds,
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
