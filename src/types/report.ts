
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ReportDefinition = {
  id: string;
  name: string;
  description?: string;
  type: string;
  permissions: string[];
  schema: ReportSchema;
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type ReportSchema = {
  filters: Record<string, 'required' | 'optional'>;
  columns: string[];
  aggregations?: string[];
  sorting?: string[];
};

export type GeneratedReport = {
  id: string;
  definition_id: string;
  user_id: string;
  parameters: Record<string, any>;
  status: ReportStatus;
  result_url?: string;
  format: ReportFormat;
  created_at: string;
  completed_at?: string;
  error?: string;
};

export type ReportFilter = {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
  value: any;
};

export type ReportParameters = {
  filters?: ReportFilter[];
  date_range?: {
    from: Date;
    to: Date;
  };
  format: ReportFormat;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
};

export type ReportRequest = {
  definition_id: string;
  parameters: ReportParameters;
};
