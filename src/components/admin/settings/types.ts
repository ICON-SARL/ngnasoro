
export interface SystemConfig {
  sfdRegistrationApproval: boolean;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  maintenanceMode: boolean;
  systemEmailAddress: string;
  passwordExpireDays: number;
  enableNotifications: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  subsidyApprovalRequired: boolean;
  defaultCurrency: string;
}
