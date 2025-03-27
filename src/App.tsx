
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { useEffect } from "react";
import { initializeSupabase } from "./utils/initSupabase";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MobileFlow from "./pages/MobileFlow";
import PremiumDashboard from "./pages/PremiumDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import AuthUI from "./components/AuthUI";
import KYCVerification from "./pages/KYCVerification";
import SupportPage from "./pages/SupportPage";
import InfrastructurePage from "./pages/InfrastructurePage";
import SFDSelector from "./pages/SFDSelector";
import MultiSFDDashboard from "./pages/MultiSFDDashboard";
import SolvencyEngine from "./pages/SolvencyEngine";
import LoanSystemPage from "./pages/LoanSystemPage";
import ClientsPage from "./pages/ClientsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Initialize Supabase when the app loads
initializeSupabase().catch(console.error);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mobile-flow" element={<MobileFlow />} />
            <Route path="/mobile-flow/*" element={<MobileFlow />} />
            <Route path="/premium-dashboard" element={<PremiumDashboard />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/agency-dashboard" element={<AgencyDashboard />} />
            <Route path="/auth" element={<AuthUI />} />
            <Route path="/kyc" element={<KYCVerification />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/sfd-selector" element={<SFDSelector />} />
            <Route path="/multi-sfd" element={<MultiSFDDashboard />} />
            <Route path="/solvency-engine" element={<SolvencyEngine />} />
            <Route path="/loan-system" element={<LoanSystemPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
