
import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import MobileFlowPage from './pages/MobileFlowPage';
import FundsPage from './pages/mobile/FundsPage';

function App() {
  // Setup the router with only the routes we actually have
  const router = createBrowserRouter([
    {
      path: "/mobile-flow/*",
      element: (
        <AuthProvider>
          <MobileFlowPage />
        </AuthProvider>
      ),
    },
    {
      path: "/mobile-flow/funds-management",
      element: (
        <AuthProvider>
          <FundsPage />
        </AuthProvider>
      ),
    },
    // Redirect to mobile flow for any other route
    {
      path: "*",
      element: (
        <AuthProvider>
          <MobileFlowPage />
        </AuthProvider>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
