
import { useState } from 'react';
import { SfdClient } from '@/types/sfdClients';
import { useSfdClients } from '@/hooks/useSfdClients';
import { toast } from '@/hooks/use-toast';

export function useSfdUserManagement() {
  const { clients, isLoading, createClient, validateClient, rejectClient } = useSfdClients();
  
  // State for UI controls
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [kycFilter, setKycFilter] = useState<number | null>(null);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SfdClient | null>(null);
  
  // Filter clients based on search term and filters
  const filteredUsers = clients.filter(client => {
    // Search term filter
    const matchesSearch = 
      !searchTerm || 
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm);
    
    // Status filter
    const matchesStatus = !statusFilter || client.status === statusFilter;
    
    // KYC level filter
    const matchesKyc = kycFilter === null || client.kyc_level === kycFilter;
    
    return matchesSearch && matchesStatus && matchesKyc;
  });
  
  // Handle client edit
  const handleEditUser = (client: SfdClient) => {
    setSelectedUser(client);
    setIsEditModalOpen(true);
  };
  
  // Handle client deletion (deactivation)
  const handleDeleteUser = (client: SfdClient) => {
    setSelectedUser(client);
    setIsDeleteModalOpen(true);
  };
  
  // Confirm deactivation
  const confirmDeactivation = async () => {
    if (!selectedUser) return;
    
    try {
      // In a real implementation, this would call an API endpoint to deactivate the client
      // For now, we'll use the reject function as a placeholder
      await rejectClient.mutateAsync({ clientId: selectedUser.id });
      toast({
        title: "Client désactivé",
        description: "Le client a été désactivé avec succès",
      });
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deactivating client:', error);
      toast({
        title: "Erreur",
        description: "Impossible de désactiver le client",
        variant: "destructive",
      });
    }
  };
  
  // Export clients data
  const exportUserData = () => {
    // Create CSV content
    const headers = ["Nom Complet", "Email", "Téléphone", "Adresse", "Statut", "Niveau KYC"];
    const csvData = [
      headers.join(","),
      ...filteredUsers.map(client => [
        client.full_name,
        client.email || "",
        client.phone || "",
        client.address || "",
        client.status,
        client.kyc_level
      ].map(value => `"${value}"`).join(","))
    ].join("\n");
    
    // Create and download the CSV file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clients_sfd_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export réussi",
      description: "Les données ont été exportées au format CSV",
    });
  };
  
  return {
    users: clients,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    statusFilter, 
    setStatusFilter,
    kycFilter,
    setKycFilter,
    isNewUserModalOpen,
    setIsNewUserModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedUser,
    setSelectedUser,
    handleEditUser,
    handleDeleteUser,
    confirmDeactivation,
    exportUserData,
    isLoading
  };
}
