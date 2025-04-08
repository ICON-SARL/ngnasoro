
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { Toaster } from "@/components/ui/toaster";
import { setupWorker } from 'msw';
import api from './api';

// Create a worker with API handlers
const apiHandlers = Object.entries(api).map(([path, handler]) => {
  return {
    url: path,
    method: 'POST',
    handler
  };
});

// Initialize the API handlers only in browser environment
if (typeof window !== 'undefined') {
  try {
    // Setup MSW only in browser environment
    const worker = setupWorker();
    
    // Start the worker
    worker.start({ 
      onUnhandledRequest: 'bypass'
    }).catch(error => {
      console.error('MSW worker initialization failed:', error);
    });
    
    console.log('Mock API server started');
  } catch (error) {
    console.warn('MSW initialization failed:', error);
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
        <Toaster />
      </Router>
    </QueryClientProvider>
  </StrictMode>
);
