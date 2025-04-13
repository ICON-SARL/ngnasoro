
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const MobileFlowPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="main" element={<div className="p-4">Dashboard principal</div>} />
        <Route path="profile" element={<div className="p-4">Profil utilisateur</div>} />
        <Route path="loans" element={<div className="p-4">Prêts</div>} />
        <Route path="transactions" element={<div className="p-4">Transactions</div>} />
        <Route path="*" element={<Navigate to="main" replace />} />
      </Routes>
    </div>
  );
};

export default MobileFlowPage;
