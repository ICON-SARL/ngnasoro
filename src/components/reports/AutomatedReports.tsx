
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { useReportGeneration } from '@/hooks/useReportGeneration';

const reportFormSchema = z.object({
  title: z.string().min(3, { message: "Le titre doit contenir au moins 3 caractères" }),
  type: z.enum(['transactions', 'loans', 'subsidies', 'sfds'], { 
    required_error: "Veuillez sélectionner un type de rapport" 
  }),
  startDate: z.date({
    required_error: "Veuillez sélectionner une date de début",
  }),
  endDate: z.date({
    required_error: "Veuillez sélectionner une date de fin",
  }),
  format: z.enum(['pdf', 'excel', 'csv'], {
    required_error: "Veuillez sélectionner un format",
  })
});

export function AutomatedReports() {
  const [savedReports, setSavedReports] = useState([
    { 
      id: 1, 
      title: 'Rapport mensuel de transactions', 
      type: 'transactions',
      frequency: 'Mensuel',
      lastRun: '10/04/2025'
    },
    { 
      id: 2, 
      title: 'Performance des prêts', 
      type: 'loans',
      frequency: 'Hebdomadaire',
      lastRun: '08/04/2025'
    }
  ]);
  
  const { isGenerating, generateReport } = useReportGeneration();
  
  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: '',
      type: 'transactions',
      format: 'pdf',
      startDate: new Date(),
      endDate: new Date()
    }
  });
  
  const onSubmit = async (data: z.infer<typeof reportFormSchema>) => {
    try {
      await generateReport({
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        format: data.format,
        sfdId: undefined // Utilise le SFD actuel de l'utilisateur
      });
      
      // Ajouter à la liste des rapports sauvegardés
      setSavedReports([
        ...savedReports, 
        { 
          id: savedReports.length + 1, 
          title: data.title, 
          type: data.type,
          frequency: 'Unique',
          lastRun: format(new Date(), 'dd/MM/yyyy')
        }
      ]);
      
      form.reset();
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    }
  };
  
  const getReportTypeLabel = (type: string) => {
    switch(type) {
      case 'transactions': return 'Transactions';
      case 'loans': return 'Prêts';
      case 'subsidies': return 'Subventions';
      case 'sfds': return 'SFDs';
      default: return type;
    }
  };
  
  const handleDownloadReport = (reportId: number) => {
    // Implémentation réelle: Déclencher le téléchargement du rapport
    console.log('Téléchargement du rapport:', reportId);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rapports automatisés</CardTitle>
          <CardDescription>
            Générez des rapports personnalisés pour suivre les performances de votre SFD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du rapport</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Rapport mensuel de transactions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de rapport</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="transactions">Transactions</SelectItem>
                          <SelectItem value="loans">Prêts</SelectItem>
                          <SelectItem value="subsidies">Subventions</SelectItem>
                          <SelectItem value="sfds">SFDs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de début</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Sélectionnez une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date de fin</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: fr })
                              ) : (
                                <span>Sélectionnez une date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format d'export</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? "Génération en cours..." : "Générer le rapport"}
              </Button>
            </form>
          </Form>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-lg font-medium mb-4">Rapports sauvegardés</h3>
            <div className="space-y-3">
              {savedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <h4 className="font-medium">{report.title}</h4>
                    <div className="text-sm text-muted-foreground">
                      <span className="mr-2">Type: {getReportTypeLabel(report.type)}</span>
                      <span className="mr-2">•</span>
                      <span className="mr-2">Fréquence: {report.frequency}</span>
                      <span className="mr-2">•</span>
                      <span>Dernière exécution: {report.lastRun}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDownloadReport(report.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                </div>
              ))}
              
              {savedReports.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun rapport sauvegardé
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
