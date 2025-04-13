
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Declare the type for the window object to include our custom function
declare global {
  interface Window {
    activateSystem: () => Promise<{ success: boolean, data?: any, error?: any }>;
  }
}

// Fonction pour faciliter l'activation du système
window.activateSystem = async () => {
  try {
    const { supabase } = await import('./integrations/supabase/client');
    console.log("Démarrage de la synchronisation des rôles...");
    const { data, error } = await supabase.functions.invoke('synchronize-user-roles');
    
    if (error) {
      console.error("Erreur de synchronisation:", error);
      return { success: false, error };
    }
    
    console.log("Synchronisation réussie:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: err };
  }
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
