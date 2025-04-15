
import React, { Component, ErrorInfo } from 'react';
import { AlertOctagon, Home, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erreur attrapée par ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <AlertOctagon className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Erreur inattendue
              </h1>
              <p className="text-gray-600">
                L'application a rencontré un problème
              </p>
            </div>
            
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Détails de l'erreur</AlertTitle>
              <AlertDescription>
                {this.state.error?.message || "Une erreur inattendue s'est produite."}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recharger
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
              >
                <Home className="mr-2 h-4 w-4" />
                Accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
