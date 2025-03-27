
import { SystemConfig } from '../types';

/**
 * Exports system configuration to a JSON file
 * @param config The current system configuration
 */
export const exportConfigToJson = (config: SystemConfig) => {
  // Create a Blob containing the configuration as JSON
  const configJson = JSON.stringify(config, null, 2);
  const blob = new Blob([configJson], { type: 'application/json' });
  
  // Create a download link and trigger it
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  
  link.href = url;
  link.download = `meref-system-settings-${date}.json`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Imports system configuration from a JSON file
 * @returns Promise that resolves to the imported configuration
 */
export const importConfigFromJson = (): Promise<SystemConfig> => {
  return new Promise((resolve, reject) => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('Aucun fichier sélectionné'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const config = JSON.parse(content) as SystemConfig;
          
          // Validate the imported configuration
          validateConfig(config);
          
          resolve(config);
        } catch (error) {
          reject(new Error('Le fichier importé n\'est pas un fichier de configuration valide'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      
      reader.readAsText(file);
    };
    
    // Clean up after file selection
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('Aucun fichier sélectionné'));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const config = JSON.parse(content) as SystemConfig;
          
          // Validate the imported configuration
          validateConfig(config);
          
          resolve(config);
        } catch (error) {
          reject(new Error('Le fichier importé n\'est pas un fichier de configuration valide'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };
      
      reader.readAsText(file);
    };
    
    // Trigger file selection
    input.click();
  });
};

/**
 * Validates that the imported configuration has all required fields
 * @param config The imported configuration object
 * @throws Error if the configuration is invalid
 */
const validateConfig = (config: any): void => {
  const requiredFields: (keyof SystemConfig)[] = [
    'sfdRegistrationApproval',
    'maxLoginAttempts',
    'sessionTimeoutMinutes',
    'maintenanceMode',
    'systemEmailAddress',
    'passwordExpireDays',
    'enableNotifications',
    'logLevel',
    'subsidyApprovalRequired',
    'defaultCurrency'
  ];
  
  for (const field of requiredFields) {
    if (config[field] === undefined) {
      throw new Error(`La configuration importée est invalide: champ '${field}' manquant`);
    }
  }
  
  // Validate log level is one of the allowed values
  if (!['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
    throw new Error(`La valeur de 'logLevel' est invalide: ${config.logLevel}`);
  }
};
