
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { ReportDefinition, GeneratedReport, ReportParameters, ReportRequest } from '@/types/report';
import { useToast } from '@/hooks/use-toast';

export function useReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDefinition, setSelectedDefinition] = useState<ReportDefinition | null>(null);

  // Query for fetching report definitions
  const {
    data: reportDefinitions,
    isLoading: isLoadingDefinitions,
    error: definitionsError
  } = useQuery({
    queryKey: ['reportDefinitions'],
    queryFn: reportService.getReportDefinitions,
    onError: (error) => {
      console.error('Error fetching report definitions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer les définitions de rapport',
        variant: 'destructive',
      });
    }
  });

  // Query for fetching user's generated reports
  const {
    data: userReports,
    isLoading: isLoadingUserReports,
    error: userReportsError
  } = useQuery({
    queryKey: ['userReports'],
    queryFn: reportService.getUserReports,
    onError: (error) => {
      console.error('Error fetching user reports:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer vos rapports',
        variant: 'destructive',
      });
    }
  });

  // Mutation for generating a new report
  const generateReportMutation = useMutation({
    mutationFn: (request: ReportRequest) => reportService.generateReport(request),
    onSuccess: () => {
      toast({
        title: 'Rapport en cours de génération',
        description: 'Votre rapport sera disponible dans quelques instants',
      });
      queryClient.invalidateQueries({ queryKey: ['userReports'] });
    },
    onError: (error) => {
      console.error('Error generating report:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le rapport',
        variant: 'destructive',
      });
    }
  });

  // Function to initiate report generation
  const generateReport = async (definitionId: string, parameters: ReportParameters) => {
    try {
      const report = await generateReportMutation.mutateAsync({
        definition_id: definitionId,
        parameters
      });
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  };

  // Function to select a report definition
  const selectReportDefinition = async (definitionId: string) => {
    try {
      const definition = await reportService.getReportDefinition(definitionId);
      setSelectedDefinition(definition);
      return definition;
    } catch (error) {
      console.error('Error fetching report definition:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de récupérer la définition du rapport',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    reportDefinitions,
    userReports,
    selectedDefinition,
    isLoading: isLoadingDefinitions || isLoadingUserReports || generateReportMutation.isPending,
    isGenerating: generateReportMutation.isPending,
    error: definitionsError || userReportsError,
    generateReport,
    selectReportDefinition,
    setSelectedDefinition
  };
}
