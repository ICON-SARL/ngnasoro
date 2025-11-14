import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportExporter: React.FC = () => {
  const { activeSfdId } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('loans');
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: sfdData } = useQuery({
    queryKey: ['sfd', activeSfdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .eq('id', activeSfdId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!activeSfdId
  });

  const generatePdfReport = async (reportData: any, title: string) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(title, 15, 20);
    doc.setFontSize(11);
    doc.text(`SFD: ${sfdData?.name || 'N/A'}`, 15, 30);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 15, 37);

    if (reportData.length > 0) {
      const columns = Object.keys(reportData[0]);
      const rows = reportData.map((item: any) => columns.map(col => item[col]));

      (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      });
    }

    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  };

  const generateExcelReport = (reportData: any, title: string) => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, title);
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`);
  };

  const generateReport = async () => {
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Aucun SFD sélectionné",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      let reportData: any[] = [];
      let title = '';

      switch (reportType) {
        case 'loans':
          title = 'Rapport des Prêts';
          const { data: loans } = await supabase
            .from('sfd_loans')
            .select(`
              *,
              sfd_clients (full_name, client_code)
            `)
            .eq('sfd_id', activeSfdId);
          
          reportData = loans?.map(loan => ({
            'Code Client': loan.sfd_clients?.client_code,
            'Nom': loan.sfd_clients?.full_name,
            'Montant': loan.amount,
            'Taux': `${loan.interest_rate * 100}%`,
            'Durée': `${loan.duration_months} mois`,
            'Statut': loan.status,
            'Restant': loan.remaining_amount
          })) || [];
          break;

        case 'clients':
          title = 'Rapport des Clients';
          const { data: clients } = await supabase
            .from('sfd_clients')
            .select('*')
            .eq('sfd_id', activeSfdId);
          
          reportData = clients?.map(client => ({
            'Code': client.client_code,
            'Nom': client.full_name,
            'Email': client.email,
            'Téléphone': client.phone,
            'Statut': client.status,
            'Niveau KYC': client.kyc_level
          })) || [];
          break;

        case 'transactions':
          title = 'Rapport des Transactions';
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('sfd_id', activeSfdId)
            .order('created_at', { ascending: false })
            .limit(100);
          
          reportData = transactions?.map(tx => ({
            'Référence': tx.reference,
            'Type': tx.type,
            'Montant': tx.amount,
            'Méthode': tx.payment_method,
            'Statut': tx.status,
            'Date': new Date(tx.created_at!).toLocaleDateString('fr-FR')
          })) || [];
          break;

        case 'subsidies':
          title = 'Rapport des Subventions';
          const { data: subsidies } = await supabase
            .from('sfd_subsidies')
            .select('*')
            .eq('sfd_id', activeSfdId);
          
          reportData = subsidies?.map(sub => ({
            'Nom': sub.name,
            'Montant': sub.amount,
            'Utilisé': sub.used_amount,
            'Disponible': sub.amount - (sub.used_amount || 0),
            'Statut': sub.status,
            'Date début': sub.start_date ? new Date(sub.start_date).toLocaleDateString('fr-FR') : 'N/A'
          })) || [];
          break;
      }

      if (reportData.length === 0) {
        toast({
          title: "Aucune donnée",
          description: "Aucune donnée disponible pour ce rapport",
          variant: "destructive"
        });
        return;
      }

      if (format === 'pdf') {
        await generatePdfReport(reportData, title);
      } else {
        generateExcelReport(reportData, title);
      }

      toast({
        title: "Rapport généré",
        description: `Le rapport a été téléchargé au format ${format.toUpperCase()}`
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export de Rapports
        </CardTitle>
        <CardDescription>
          Exportez vos données au format PDF ou Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Type de rapport</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="loans">Prêts</SelectItem>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
              <SelectItem value="subsidies">Subventions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as 'pdf' | 'excel')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={generateReport} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exporter le rapport
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReportExporter;