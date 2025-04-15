
export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json';

export interface ExportOptions {
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
  columns?: string[];
}

export interface ExportRequest {
  type: string;
  format: ExportFormat;
  options?: ExportOptions;
}
