
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { SfdClient } from '@/types/sfdClients';

export function useClientExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCSV = async (clients: SfdClient[]) => {
    try {
      setIsExporting(true);

      // Format data for export
      const data = clients.map(client => ({
        'Nom complet': client.full_name,
        'Email': client.email || '',
        'Téléphone': client.phone || '',
        'Adresse': client.address || '',
        'Type de pièce': client.id_type || '',
        'Numéro de pièce': client.id_number || '',
        'Statut': client.status,
        'Niveau KYC': client.kyc_level || 0,
        'Date de création': new Date(client.created_at).toLocaleDateString('fr-FR'),
        'Date de validation': client.validated_at ? new Date(client.validated_at).toLocaleDateString('fr-FR') : ''
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Clients');

      // Generate and download file
      XLSX.writeFile(wb, `clients_export_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: 'Export réussi',
        description: 'La liste des clients a été exportée avec succès',
      });
    } catch (error) {
      console.error('Error exporting clients:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'export',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToCSV,
    isExporting
  };
}
