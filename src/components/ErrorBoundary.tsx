
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Erreur non gérée:', error);
    console.error('Détails de l\'erreur:', errorInfo);
    
    // Ici, vous pourriez envoyer l'erreur à un service de suivi des erreurs
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Vous pouvez personnaliser l'interface utilisateur de secours
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="p-6 bg-white rounded-lg shadow-lg max-w-md w-full text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Une erreur s'est produite</h1>
            <p className="text-gray-600 mb-4">
              L'application a rencontré un problème inattendu. Veuillez actualiser la page ou réessayer plus tard.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {this.state.error?.message || "Erreur inconnue"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Actualiser la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
