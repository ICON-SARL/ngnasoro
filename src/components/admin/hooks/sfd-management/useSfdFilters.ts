
import { useState, useMemo } from 'react';
import { Sfd, SfdStatus } from '../../types/sfd-types';

export function useSfdFilters(sfds: any[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SfdStatus | null>(null);

  const filteredSfds = useMemo(() => {
    return sfds.filter((sfd) => {
      // Make sure the SFD is properly typed
      const typedSfd = sfd as Sfd;
      
      const matchesSearch =
        !searchTerm ||
        typedSfd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        typedSfd.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (typedSfd.region && typedSfd.region.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !statusFilter || typedSfd.status === statusFilter;

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
