
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupDatabase, synchronizeUserRoles } from './utils/setupDatabase';
import ErrorBoundary from './components/ErrorBoundary';

// Fonction pour faciliter l'activation du système - uniquement en développement
if (process.env.NODE_ENV === 'development') {
  window.activateSystem = async () => {
    try {
      console.log("Démarrage de l'activation du système...");
      const success = await setupDatabase();
      
      if (!success) {
        console.error("Erreur d'activation du système");
        return { success: false, error: "Échec de l'activation du système" };
      }
      
      console.log("Activation du système réussie");
      return { 
        success: true, 
        data: { 
          message: "Le système a été activé avec succès" 
        } 
      };
    } catch (err) {
      console.error("Erreur:", err);
      return { success: false, error: err };
    }
  };

  // Fonction pour synchroniser les rôles utilisateurs - uniquement en développement
  window.synchronizeUserRoles = async () => {
    try {
      console.log("Démarrage de la synchronisation des rôles...");
      const success = await synchronizeUserRoles();
      
      if (!success) {
        console.error("Erreur de synchronisation des rôles");
        return { success: false, error: "Échec de la synchronisation des rôles" };
      }
      
      console.log("Synchronisation des rôles réussie");
      return { 
        success: true, 
        data: { 
          message: "Les rôles ont été synchronisés avec succès" 
        } 
      };
    } catch (err) {
      console.error("Erreur:", err);
      return { success: false, error: err };
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
