
import { useQuery } from '@tanstack/react-query';
import { useSfdAdminsList } from './useSfdAdminsList';
import { SfdAdmin } from './useSfdAdminsList';

export type { SfdAdmin };

export function useSfdAdminManagement() {
  // Cette fonction sert de point d'entrée pour la gestion des administrateurs SFD
  // Elle pourra être étendue pour inclure d'autres fonctionnalités au besoin
  
  // Pour l'instant, on réexporte simplement les données de useSfdAdminsList
  const { sfdAdmins, isLoading, error, refetch } = useSfdAdminsList('');
  
  return {
    sfdAdmins,
    isLoading,
    error,
    refetch
  };
}
