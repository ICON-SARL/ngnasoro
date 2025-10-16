import { supabase } from '@/integrations/supabase/client';
import { ReportDefinition, GeneratedReport, ReportParameters } from '@/types/report';

/**
 * Service pour gérer les rapports
 */

export const reportService = {
  /**
   * Récupère toutes les définitions de rapports
   */
  getReportDefinitions: async (): Promise<ReportDefinition[]> => {
    try {
      const { data, error } = await supabase
        .from('report_definitions')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching report definitions:', error);
        return [];
      }

      return (data || []) as ReportDefinition[];
    } catch (error) {
      console.error('Error in getReportDefinitions:', error);
      return [];
    }
  },

  /**
   * Crée une nouvelle définition de rapport
   */
  createReportDefinition: async (
    definition: Omit<ReportDefinition, 'id' | 'created_at' | 'updated_at'>
  ): Promise<ReportDefinition | null> => {
    try {
      const { data, error } = await supabase
        .from('report_definitions')
        .insert(definition as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating report definition:', error);
        return null;
      }

      return data as ReportDefinition;
    } catch (error) {
      console.error('Error in createReportDefinition:', error);
      return null;
    }
  },

  /**
   * Génère un nouveau rapport
   */
  generateReport: async (
    definitionId: string,
    parameters: ReportParameters
  ): Promise<GeneratedReport | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        return null;
      }

      const { data, error } = await supabase
        .from('generated_reports')
        .insert({
          definition_id: definitionId,
          user_id: user.user.id,
          parameters: parameters as any,
          format: parameters.format,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating report:', error);
        return null;
      }

      return data as GeneratedReport;
    } catch (error) {
      console.error('Error in generateReport:', error);
      return null;
    }
  },

  /**
   * Récupère les rapports générés par l'utilisateur
   */
  getUserReports: async (): Promise<GeneratedReport[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user reports:', error);
        return [];
      }

      return (data || []) as GeneratedReport[];
    } catch (error) {
      console.error('Error in getUserReports:', error);
      return [];
    }
  },

  /**
   * Met à jour le statut d'un rapport
   */
  updateReportStatus: async (
    reportId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    resultUrl?: string,
    error?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = { status };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        if (resultUrl) updateData.result_url = resultUrl;
      }
      
      if (status === 'failed' && error) {
        updateData.error = error;
      }

      const { error: updateError } = await supabase
        .from('generated_reports')
        .update(updateData)
        .eq('id', reportId);

      if (updateError) {
        console.error('Error updating report status:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateReportStatus:', error);
      return false;
    }
  }
};
