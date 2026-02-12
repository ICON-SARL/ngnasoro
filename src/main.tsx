
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupDatabase, synchronizeUserRoles } from './utils/setupDatabase';
import { logger } from './utils/logger';

declare global {
  interface Window {
    activateSystem: () => Promise<{ success: boolean, data?: Record<string, string>, error?: unknown }>;
    synchronizeUserRoles: () => Promise<{ success: boolean, data?: Record<string, string>, error?: unknown }>;
  }
}

window.activateSystem = async () => {
  try {
    logger.log("Démarrage de l'activation du système...");
    const success = await setupDatabase();
    
    if (!success) {
      logger.error("Erreur d'activation du système");
      return { success: false, error: "Échec de l'activation du système" };
    }
    
    logger.log("Activation du système réussie");
    return { success: true, data: { message: "Le système a été activé avec succès" } };
  } catch (err) {
    logger.error("Erreur:", err);
    return { success: false, error: err };
  }
};

window.synchronizeUserRoles = async () => {
  try {
    logger.log("Démarrage de la synchronisation des rôles...");
    const success = await synchronizeUserRoles();
    
    if (!success) {
      logger.error("Erreur de synchronisation des rôles");
      return { success: false, error: "Échec de la synchronisation des rôles" };
    }
    
    logger.log("Synchronisation des rôles réussie");
    return { success: true, data: { message: "Les rôles ont été synchronisés avec succès" } };
  } catch (err) {
    logger.error("Erreur:", err);
    return { success: false, error: err };
  }
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <App />
);
