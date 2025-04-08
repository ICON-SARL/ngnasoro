
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { Toaster } from "@/components/ui/toaster";
import api from './api';

// Create a worker with API handlers
if (typeof window !== 'undefined') {
  try {
    // Dynamic import for MSW to avoid server-side rendering issues
    import('msw').then(async ({ worker }) => {
      // Convert our API to MSW handlers
      const handlers = Object.entries(api).map(([path, handlerFn]) => {
        return {
          url: path,
          method: 'POST',
          async resolver(req, res, ctx) {
            const result = await handlerFn(req);
            return res(ctx.json(result));
          }
        };
      });
      
      // Start the worker
      worker.start({ 
        onUnhandledRequest: 'bypass'
      }).catch(error => {
        console.error('MSW worker initialization failed:', error);
      });
      
      console.log('Mock API server started');
    }).catch(error => {
      console.warn('MSW initialization failed:', error);
    });
  } catch (error) {
    console.warn('MSW initialization error:', error);
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
