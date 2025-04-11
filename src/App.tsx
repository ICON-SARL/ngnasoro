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
import { SfdManagement } from '@/components/admin/SfdManagement';
import { AdminManagementPage } from '@/components/admin/management/AdminManagementPage';
import { SfdUserManagement } from '@/components/sfd/SfdUserManagement';
import { UserManagement } from '@/components/UserManagement';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Redirection page - new route */}
          <Route path="/login" element={<AuthRedirectPage />} />
          
          {/* Authentication routes */}
          <Route path="/auth" element={<AuthUI />} />
          <Route path="/admin/auth" element={<AdminLoginPage />} />
          <Route path="/sfd/auth" element={<SfdLoginPage />} />

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
              <ProtectedRoute requireAdmin>
                <SfdManagement />
              </ProtectedRoute>
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

          {/* Mobile Flow */}
          <Route path="/mobile-flow" element={<AuthUI />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
