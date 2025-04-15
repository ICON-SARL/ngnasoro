
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';

const MobileFlowPage = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mobile-flow/profile" replace />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/sfd-selector" element={<SfdSelectorPage />} />
      <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
    </Routes>
  );
};

export default MobileFlowPage;
