
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MobileMyLoansPageContainer from './pages/mobile/MobileMyLoansPage';
import LoanApplicationPageContainer from './pages/mobile/LoanApplicationPage';
import ClientLoanStatus from './components/ClientLoanStatus';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Mobile Routes */}
          <Route path="/mobile-flow/my-loans" element={<MobileMyLoansPageContainer />} />
          <Route path="/loans/status" element={<ClientLoanStatus />} />
          <Route path="/loans/apply" element={<LoanApplicationPageContainer />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
