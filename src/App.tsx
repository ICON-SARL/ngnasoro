
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mobile-flow" element={<MobileFlow />} />
          <Route path="/premium-dashboard" element={<PremiumDashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/agency-dashboard" element={<AgencyDashboard />} />
          <Route path="/auth" element={<AuthUI />} />
          <Route path="/kyc" element={<KYCVerification />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/infrastructure" element={<InfrastructurePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
