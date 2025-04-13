
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MobileMyLoansPageContainer from './pages/mobile/MobileMyLoansPage';
import LoanApplicationPageContainer from './pages/mobile/LoanApplicationPage';
import ClientLoanStatus from './components/ClientLoanStatus';
import MobileFlowPage from './pages/MobileFlowPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Mobile Flow Main Route */}
            <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
            
            {/* Standalone Mobile Routes */}
            <Route path="/mobile-flow/my-loans" element={<MobileMyLoansPageContainer />} />
            <Route path="/loans/status" element={<ClientLoanStatus />} />
            <Route path="/loans/apply" element={<LoanApplicationPageContainer />} />
            
            {/* Default route */}
            <Route path="/" element={<LoginPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
