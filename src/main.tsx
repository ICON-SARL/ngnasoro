
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { Toaster } from "@/components/ui/toaster";
import api from './api';
import { AuthProvider } from '@/hooks/auth/index'; // Import from the correct path

// Create a worker with API handlers
if (typeof window !== 'undefined') {
  try {
    // Dynamic import for MSW to avoid server-side rendering issues
    import('msw').then(async (mswModule) => {
      const { http } = mswModule;
      
      // Convert our API to MSW handlers using the correct http method functions
      const handlers = Object.entries(api).map(([path, handlerFn]) => {
        return http.post(path, async ({ request }) => {
          const result = await handlerFn(request);
          return Response.json(result);
        });
      });
      
      // Import the setupWorker function from msw/browser
      const { setupWorker } = await import('msw/browser');
      
      if (!setupWorker) {
        console.error('MSW setupWorker function not found');
        return;
      }
      
      // Create the worker with our handlers
      const worker = setupWorker(...handlers);
      
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
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <App />
          <Toaster />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
