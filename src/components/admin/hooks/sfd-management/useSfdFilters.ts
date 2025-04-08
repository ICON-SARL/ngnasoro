
import { useState, useMemo } from 'react';
import { Sfd } from '../../types/sfd-types';

export function useSfdFilters(sfds: Sfd[] | undefined) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter SFDs based on search term and status filter
  const filteredSfds = useMemo(() => {
    if (!sfds) return [];
    
    return sfds.filter((sfd) => {
      const matchesSearch = 
        sfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sfd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sfd.region && sfd.region.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus =
        statusFilter === 'all' ||
        sfd.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [sfds, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredSfds
  };
}
