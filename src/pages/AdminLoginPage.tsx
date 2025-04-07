
import React from 'react';
import AdminAuthUI from '@/components/auth/AdminAuthUI';

interface AdminLoginPageProps {
  isSfdAdmin?: boolean;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ isSfdAdmin = false }) => {
  return <AdminAuthUI />;
};

export default AdminLoginPage;
