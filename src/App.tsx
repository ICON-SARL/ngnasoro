
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import AuthenticationGuard from './components/AuthenticationGuard';
import AnonymousOnlyGuard from './components/AnonymousOnlyGuard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { useRoutes } from 'react-router-dom';

// Create a new query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Navigate to="/auth" replace />} />
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  
                  {/* Protected Mobile Flow Routes */}
                  <Route 
                    path="/mobile-flow/profile" 
                    element={
                      <AuthenticationGuard>
                        <ProfilePage />
                      </AuthenticationGuard>
                    } 
                  />
                  
                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
                <Toaster />
              </div>
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
