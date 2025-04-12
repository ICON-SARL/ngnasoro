
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLoginPage from '@/pages/AdminLoginPage';
import SfdLoginPage from '@/pages/SfdLoginPage';
import AuthRedirectPage from '@/pages/AuthRedirectPage';
import AuthUI from '@/components/AuthUI';
import AgencyDashboard from '@/pages/AgencyDashboard';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import UsersManagementPage from '@/pages/admin/UsersManagementPage';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PermissionProtectedRoute from '@/components/routes/PermissionProtectedRoute';
import { UserRole } from '@/utils/auth/roleTypes';
import { AdminManagementPage } from '@/components/admin/management/AdminManagementPage';
import { SfdUserManagement } from '@/components/sfd/SfdUserManagement';
import { UserManagement } from '@/components/UserManagement';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import SfdManagementPage from '@/pages/admin/SfdManagementPage';
import MobileRouter from '@/components/Router';
import TestAuth from '@/components/auth/TestAuth';

function App() {
  console.log("Rendering main App component");
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Redirection page - page de choix du type de connexion */}
          <Route path="/login" element={<AuthRedirectPage />} />
          
          {/* Routes d'authentification */}
          <Route path="/auth" element={<AuthUI />} />
          <Route path="/admin/auth" element={<AdminLoginPage />} />
          <Route path="/sfd/auth" element={<SfdLoginPage />} />
          <Route path="/test-auth" element={<TestAuth />} />

          {/* Agency Dashboard */}
          <Route 
            path="/agency-dashboard" 
            element={
              <ProtectedRoute requireSfdAdmin>
                <AgencyDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Super Admin Dashboard */}
          <Route
            path="/super-admin-dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Users Management Page */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />
          
          {/* SFD Management Page */}
          <Route
            path="/admin/sfds"
            element={
              <PermissionProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
                <SfdManagementPage />
              </PermissionProtectedRoute>
            }
          />
          
          {/* Admin Management Page */}
          <Route
            path="/admin/management"
            element={
              <PermissionProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
                <AdminManagementPage />
              </PermissionProtectedRoute>
            }
          />
          
          {/* SFD User Management Page */}
          <Route
            path="/sfd/users"
            element={
              <PermissionProtectedRoute requiredRole={UserRole.SFD_ADMIN}>
                <SfdUserManagement />
              </PermissionProtectedRoute>
            }
          />
          
          {/* Multi-collaborators Management Page */}
          <Route
            path="/admin/multi-collaborators"
            element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Access Denied Page */}
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Mobile Flow - using Router component for all mobile-flow paths */}
          <Route path="/mobile-flow/*" element={<MobileRouter />} />
          
          {/* Redirection par défaut vers la page de sélection du type de connexion */}
          <Route path="/" element={<AuthRedirectPage />} />
          
          {/* Routes for SFD management and credit approval */}
          <Route
            path="/sfd-management"
            element={
              <ProtectedRoute requireAdmin>
                <SfdManagementPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/credit-approval"
            element={
              <ProtectedRoute requireAdmin>
                <CreditApprovalPage />
              </ProtectedRoute>
            }
          />
          
          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

import NotFound from '@/pages/NotFound';

export default App;
