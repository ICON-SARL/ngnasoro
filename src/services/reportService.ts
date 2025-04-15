
import { supabase } from '@/integrations/supabase/client';
import { ReportDefinition, GeneratedReport, ReportParameters, ReportRequest } from '@/types/report';

export const reportService = {
  async getReportDefinitions(): Promise<ReportDefinition[]> {
    const { data, error } = await supabase
      .from('report_definitions')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as ReportDefinition[];
  },

  async getReportDefinition(id: string): Promise<ReportDefinition> {
    const { data, error } = await supabase
      .from('report_definitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ReportDefinition;
  },

  async generateReport(request: ReportRequest): Promise<GeneratedReport> {
    // Prepare parameters for JSON serialization by converting dates to ISO strings
    const serializedParameters = {
      ...request.parameters,
      date_range: request.parameters.date_range ? {
        from: request.parameters.date_range.from ? new Date(request.parameters.date_range.from).toISOString() : undefined,
        to: request.parameters.date_range.to ? new Date(request.parameters.date_range.to).toISOString() : undefined
      } : undefined,
    };

    // First, create a record of the report generation request
    const { data: report, error: insertError } = await supabase
      .from('generated_reports')
      .insert({
        definition_id: request.definition_id,
        parameters: serializedParameters,
        format: request.parameters.format,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Then, call the edge function to generate the report
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          report_id: report.id,
          definition_id: request.definition_id,
          parameters: serializedParameters
        }
      });

      if (error) throw error;

      // Update the report status based on the response
      if (data.status === 'processing') {
        await this.updateReportStatus(report.id, 'processing');
      }

      return report as GeneratedReport;
    } catch (functionError) {
      // If the function call fails, update the report status to failed
      await this.updateReportStatus(report.id, 'failed', functionError.message);
      throw functionError;
    }
  },

  async getUserReports(): Promise<GeneratedReport[]> {
    const { data, error } = await supabase
      .from('generated_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as GeneratedReport[];
  },

  async getReportById(id: string): Promise<GeneratedReport> {
    const { data, error } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as GeneratedReport;
  },

  async updateReportStatus(
    id: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed',
    error?: string
  ): Promise<void> {
    const update: any = { status };
    
    if (status === 'completed') {
      update.completed_at = new Date().toISOString();
    }
    
    if (error) {
      update.error = error;
    }

    const { error: updateError } = await supabase
      .from('generated_reports')
      .update(update)
      .eq('id', id);

    if (updateError) throw updateError;
  },

  async updateReportUrl(id: string, url: string): Promise<void> {
    const { error } = await supabase
      .from('generated_reports')
      .update({
        result_url: url,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  }
};
