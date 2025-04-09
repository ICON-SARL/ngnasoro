
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import MobileFlow from '@/components/mobile/MobileFlow';
import AdminLoginPage from '@/pages/AdminLoginPage';
import SfdLoginPage from '@/pages/SfdLoginPage';
import SfdSelectionPage from '@/pages/SfdSelectionPage';
import FundsManagementPage from '@/components/mobile/funds-management/FundsManagementPage';
import { SecurePaymentTab } from '@/components/mobile/secure-payment';
import AdminRoutes from './AdminRoutes';
import SfdRoutes from './SfdRoutes';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import AdminRoleManagementPage from '@/pages/AdminRoleManagementPage';
import UsersManagementPage from '@/pages/UsersManagementPage';

const HomePage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">MEREF Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-2">Client Access</h2>
          <p className="text-gray-600 mb-4">Access client services and mobile banking features</p>
          <div className="space-y-2">
            <div>
              <a href="/client/auth" className="text-blue-600 hover:underline block">Client Login</a>
            </div>
            <div>
              <a href="/mobile-flow" className="text-blue-600 hover:underline block">Mobile App</a>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-medium mb-2">Administration</h2>
          <p className="text-gray-600 mb-4">Access administrative and management portals</p>
          <div className="space-y-2">
            <div>
              <a href="/admin/auth" className="text-blue-600 hover:underline block">MEREF Admin</a>
            </div>
            <div>
              <a href="/sfd/auth" className="text-blue-600 hover:underline block">SFD Admin</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/client/auth" element={<ClientLoginPage />} />
      <Route path="/admin/auth" element={<AdminLoginPage />} />
      <Route path="/sfd/auth" element={<SfdLoginPage />} />
      <Route path="/sfd-selection" element={<SfdSelectionPage />} />
      
      <Route path="/mobile-flow/*" element={<MobileFlow />} />
      <Route path="/mobile-flow/funds" element={<FundsManagementPage />} />
      <Route path="/mobile-flow/secure-payment" element={<SecurePaymentTab />} />
      
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
      <Route path="/admin-role-management" element={<AdminRoleManagementPage />} />
      <Route path="/users-management" element={<UsersManagementPage />} />
      <Route path="/sfd-management" element={<Navigate to="/admin/sfd-management" replace />} />
      
      <Route path="/sfd/*" element={<SfdRoutes />} />
      <Route path="/agency-dashboard" element={<Navigate to="/sfd/dashboard" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
