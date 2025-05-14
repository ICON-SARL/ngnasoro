
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '../routes';
import { AuthProvider } from '@/hooks/auth/AuthContext';

const Router = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default Router;
