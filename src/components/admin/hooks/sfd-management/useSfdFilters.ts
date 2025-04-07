
import { useState, useMemo } from 'react';
import { Sfd, SfdStatus } from '../../types/sfd-types';

export function useSfdFilters(sfds: any[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredSfds = useMemo(() => {
    return sfds.filter((sfd) => {
      // Convert incoming status to proper SfdStatus type
      const typedSfd = {
        ...sfd,
        status: sfd.status as SfdStatus
      };
      
      const matchesSearch =
        !searchTerm ||
        typedSfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        typedSfd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typedSfd.region && typedSfd.region.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !statusFilter || typedSfd.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).map(sfd => ({
      ...sfd,
      status: sfd.status as SfdStatus
    }));
  }, [sfds, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredSfds
  };
}
