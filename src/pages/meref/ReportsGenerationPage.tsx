import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logger } from '@/utils/logger';

export default function ReportsGenerationPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>('monthly');
  const [format, setFormat] = useState<string>('pdf');
  const [period, setPeriod] = useState<string>('current-month');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'monthly', label: 'Rapport Mensuel Global', description: "Vue d'ensemble de tous les SFDs" },
    { value: 'sfd', label: 'Rapport par SFD', description: "Performance d'un SFD spécifique" },
    { value: 'subsidies', label: 'Rapport Subventions', description: 'Utilisation des subventions' },
    { value: 'risk', label: 'Rapport Risque', description: 'Analyse des prêts à risque' }
  ];

  const getPeriodDates = () => {
    const now = new Date();
    let start: Date;
    let end = now;

    switch (period) {
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current-quarter':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'last-quarter': {
        const qStart = Math.floor(now.getMonth() / 3) * 3 - 3;
        start = new Date(now.getFullYear(), qStart, 1);
        end = new Date(now.getFullYear(), qStart + 3, 0);
        break;
      }
      case 'current-year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return { start: start!, end };
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast({ title: "Génération en cours", description: "Votre rapport sera disponible dans quelques instants" });

    try {
      const { start, end } = getPeriodDates();
      
      // Fetch loans data
      const { data: loans, error: loansError } = await supabase
        .from('sfd_loans')
        .select('*, sfd_clients!client_id(full_name), sfds!sfd_id(name)')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (loansError) throw loansError;

      const doc = new jsPDF();
      const periodLabel = `${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`;
      const typeLabel = reportTypes.find(r => r.value === reportType)?.label || reportType;

      // Header
      doc.setFontSize(18);
      doc.text(`N'GNA SORO! - ${typeLabel}`, 14, 20);
      doc.setFontSize(10);
      doc.text(`Période : ${periodLabel}`, 14, 28);
      doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 34);

      // Stats summary
      doc.setFontSize(12);
      doc.text('Résumé', 14, 46);
      
      const totalAmount = loans?.reduce((sum, l) => sum + (l.amount || 0), 0) || 0;
      const totalRemaining = loans?.reduce((sum, l) => sum + (l.remaining_amount || 0), 0) || 0;
      const activeLoans = loans?.filter(l => l.status === 'active').length || 0;
      const defaultedLoans = loans?.filter(l => l.status === 'defaulted').length || 0;

      autoTable(doc, {
        startY: 50,
        head: [['Indicateur', 'Valeur']],
        body: [
          ['Total prêts', `${loans?.length || 0}`],
          ['Montant total décaissé', `${totalAmount.toLocaleString('fr-FR')} FCFA`],
          ['Montant restant dû', `${totalRemaining.toLocaleString('fr-FR')} FCFA`],
          ['Prêts actifs', `${activeLoans}`],
          ['Prêts défaillants', `${defaultedLoans}`],
        ],
        theme: 'grid',
      });

      // Loans table
      const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 100;
      doc.setFontSize(12);
      doc.text('Détail des prêts', 14, finalY + 10);

      interface LoanRow {
        sfd_clients: { full_name: string } | null;
        sfds: { name: string } | null;
        amount: number;
        remaining_amount: number;
        status: string;
        created_at: string;
      }

      autoTable(doc, {
        startY: finalY + 14,
        head: [['Client', 'SFD', 'Montant', 'Restant', 'Statut', 'Date']],
        body: (loans || []).slice(0, 50).map((loan: LoanRow) => [
          (loan.sfd_clients as { full_name: string } | null)?.full_name || 'N/A',
          (loan.sfds as { name: string } | null)?.name || 'N/A',
          `${(loan.amount || 0).toLocaleString('fr-FR')} FCFA`,
          `${(loan.remaining_amount || 0).toLocaleString('fr-FR')} FCFA`,
          loan.status,
          new Date(loan.created_at).toLocaleDateString('fr-FR'),
        ]),
        theme: 'striped',
        styles: { fontSize: 8 },
      });

      doc.save(`rapport-${reportType}-${period}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({ title: "Rapport prêt", description: "Votre rapport PDF a été téléchargé" });
    } catch (err) {
      logger.error('Report generation error:', err);
      toast({ title: "Erreur", description: "Impossible de générer le rapport", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Génération de Rapports</h1>
        <p className="text-muted-foreground">Créez des rapports détaillés sur l'activité de l'écosystème</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nouveau Rapport</CardTitle>
            <CardDescription>Sélectionnez le type de rapport à générer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Type de Rapport</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mois en cours</SelectItem>
                  <SelectItem value="last-month">Mois dernier</SelectItem>
                  <SelectItem value="current-quarter">Trimestre en cours</SelectItem>
                  <SelectItem value="last-quarter">Dernier trimestre</SelectItem>
                  <SelectItem value="current-year">Année en cours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              {isGenerating ? 'Génération...' : 'Générer le Rapport'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapports Récents</CardTitle>
            <CardDescription>Historique de vos rapports générés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Rapport Mensuel - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Généré il y a {i + 1} jour{i > 0 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
