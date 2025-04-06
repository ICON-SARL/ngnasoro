
import React from 'react';
import AdminAuthUI from '@/components/auth/AdminAuthUI';
import SfdAuthUI from '@/components/auth/SfdAuthUI';

interface AdminLoginPageProps {
  isSfdAdmin?: boolean;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ isSfdAdmin = false }) => {
  // Return the appropriate auth UI based on the isSfdAdmin prop
  return isSfdAdmin ? <SfdAuthUI /> : <AdminAuthUI />;
};

export default AdminLoginPage;
