
// Ce fichier existe déjà, je vais seulement ajouter une section pour
// améliorer la gestion des appels de fonctions Edge

import { toast as toastFunction } from "@/hooks/use-toast";

// Dans ce fichier, je vais ajouter une fonction callEdgeFunction améliorée
// qui gère mieux les erreurs et contourne le cache

export const edgeFunctionApi = {
  // Fonction améliorée pour appeler les fonctions Edge avec gestion du cache
  callEdgeFunction: async (functionName: string, payload: any, options?: { showToast?: boolean, bypassCache?: boolean }) => {
    const { showToast = false, bypassCache = false } = options || {};
    
    try {
      // Ajouter un timestamp pour éviter le cache
      const cacheBypassParam = bypassCache ? `?cb=${Date.now()}` : '';
      
      // URL de la fonction Edge avec paramètre anti-cache si nécessaire
      const functionUrl = `${window.location.origin}/api/functions/${functionName}${cacheBypassParam}`;
      
      // Préparer les headers avec des options anti-cache si nécessaire
      const headers = {
        'Content-Type': 'application/json',
        'Pragma': bypassCache ? 'no-cache' : '',
        'Cache-Control': bypassCache ? 'no-cache, no-store, must-revalidate' : '',
      };
      
      console.log(`Calling edge function ${functionName} with payload:`, payload);
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      
      // Vérifier si la réponse est OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Edge function ${functionName} returned error ${response.status}:`, errorText);
        
        let errorMessage = `Error calling ${functionName} (${response.status})`;
        try {
          // Tenter de parser le message d'erreur JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Si ce n'est pas du JSON valide, utiliser le texte brut
          errorMessage = errorText || errorMessage;
        }
        
        if (showToast) {
          toastFunction({
            title: "Erreur",
            description: errorMessage,
            variant: "destructive"
          });
        }
        
        throw new Error(errorMessage);
      }
      
      // Récupérer et retourner les données
      const data = await response.json();
      console.log(`Edge function ${functionName} returned:`, data);
      
      return data;
    } catch (error: any) {
      console.error(`Error in edge function ${functionName}:`, error);
      
      if (showToast) {
        toastFunction({
          title: "Erreur",
          description: error.message || `Erreur lors de l'appel à ${functionName}`,
          variant: "destructive",
        });
      }
      
      throw error;
    }
  }
};
