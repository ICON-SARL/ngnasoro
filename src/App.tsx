import React, { useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import { Layout } from "@/components/Layout"
import { Home } from "@/pages/Home"
import { About } from "@/pages/About"
import { Contact } from "@/pages/Contact"
import { Pricing } from "@/pages/Pricing"
import { Terms } from "@/pages/Terms"
import { Policy } from "@/pages/Policy"
import { Docs } from "@/pages/Docs"
import { DocsArticle } from "@/pages/DocsArticle"
import { Examples } from "@/pages/Examples"
import { ExamplesTable } from "@/pages/ExamplesTable"
import { ExamplesKanban } from "@/pages/ExamplesKanban"
import { ExamplesTasks } from "@/pages/ExamplesTasks"
import { ExamplesSettings } from "@/pages/ExamplesSettings"
import { ExamplesBilling } from "@/pages/ExamplesBilling"
import { ExamplesCheckout } from "@/pages/ExamplesCheckout"
import { ExamplesLogin } from "@/pages/ExamplesLogin"
import { ExamplesRegister } from "@/pages/ExamplesRegister"
import { ExamplesForgotPassword } from "@/pages/ExamplesForgotPassword"
import { ExamplesNewPassword } from "@/pages/ExamplesNewPassword"
import { Examples404 } from "@/pages/Examples404"
import { Examples500 } from "@/pages/Examples500"
import { ExamplesMaintenance } from "@/pages/ExamplesMaintenance"
import { ExamplesComingSoon } from "@/pages/ExamplesComingSoon"
import { ExamplesSearch } from "@/pages/ExamplesSearch"
import { ExamplesEmail } from "@/pages/ExamplesEmail"
import { ExamplesChat } from "@/pages/ExamplesChat"
import { ExamplesFile } from "@/pages/ExamplesFile"
import { ExamplesCalendar } from "@/pages/ExamplesCalendar"
import { ExamplesProfile } from "@/pages/ExamplesProfile"
import { ExamplesTeam } from "@/pages/ExamplesTeam"
import { ExamplesInvoice } from "@/pages/ExamplesInvoice"
import { ExamplesBlog } from "@/pages/ExamplesBlog"
import { ExamplesPost } from "@/pages/ExamplesPost"
import { ExamplesPricing } from "@/pages/ExamplesPricing"
import { ExamplesFaqs } from "@/pages/ExamplesFaqs"
import { ExamplesTestimonials } from "@/pages/ExamplesTestimonials"
import { ExamplesReviews } from "@/pages/ExamplesReviews"
import { ExamplesCareers } from "@/pages/ExamplesCareers"
import { ExamplesJobs } from "@/pages/ExamplesJobs"
import { ExamplesJob } from "@/pages/ExamplesJob"
import { ExamplesCompany } from "@/pages/ExamplesCompany"
import { ExamplesCaseStudies } from "@/pages/ExamplesCaseStudies"
import { ExamplesCaseStudy } from "@/pages/ExamplesCaseStudy"
import { ExamplesContact } from "@/pages/ExamplesContact"
import { ExamplesTerms } from "@/pages/ExamplesTerms"
import { ExamplesPolicy } from "@/pages/ExamplesPolicy"
import { ExamplesAccount } from "@/pages/ExamplesAccount"
import { ExamplesSecurity } from "@/pages/ExamplesSecurity"
import { ExamplesNotifications } from "@/pages/ExamplesNotifications"
import { ExamplesIntegrations } from "@/pages/ExamplesIntegrations"
import { ExamplesApi } from "@/pages/ExamplesApi"
import { ExamplesSettingsTeam } from "@/pages/ExamplesSettingsTeam"
import { ExamplesSettingsBilling } from "@/pages/ExamplesSettingsBilling"
import { ExamplesSettingsNotifications } from "@/pages/ExamplesSettingsNotifications"
import { ExamplesSettingsSecurity } from "@/pages/ExamplesSettingsSecurity"
import { ExamplesSettingsIntegrations } from "@/pages/ExamplesSettingsIntegrations"
import { ExamplesSettingsApi } from "@/pages/ExamplesSettingsApi"
import { ExamplesSettingsAccount } from "@/pages/ExamplesSettingsAccount"
import { ExamplesSettingsProfile } from "@/pages/ExamplesSettingsProfile"
import { ExamplesSettingsEmail } from "@/pages/ExamplesSettingsEmail"
import { ExamplesSettingsChat } from "@/pages/ExamplesSettingsChat"
import { ExamplesSettingsFile } from "@/pages/ExamplesSettingsFile"
import { ExamplesSettingsCalendar } from "@/pages/ExamplesSettingsCalendar"
import { ExamplesSettingsInvoice } from "@/pages/ExamplesSettingsInvoice"
import { ExamplesSettingsBlog } from "@/pages/ExamplesSettingsBlog"
import { ExamplesSettingsPost } from "@/pages/ExamplesSettingsPost"
import { ExamplesSettingsPricing } from "@/pages/ExamplesSettingsPricing"
import { ExamplesSettingsFaqs } from "@/pages/ExamplesSettingsFaqs"
import { ExamplesSettingsTestimonials } from "@/pages/ExamplesSettingsTestimonials"
import { ExamplesSettingsReviews } from "@/pages/ExamplesSettingsReviews"
import { ExamplesSettingsCareers } from "@/pages/ExamplesSettingsCareers"
import { ExamplesSettingsJobs } from "@/pages/ExamplesSettingsJobs"
import { ExamplesSettingsJob } from "@/pages/ExamplesSettingsJob"
import { ExamplesSettingsCompany } from "@/pages/ExamplesSettingsCompany"
import { ExamplesSettingsCaseStudies } from "@/pages/ExamplesSettingsCaseStudies"
import { ExamplesSettingsCaseStudy } from "@/pages/ExamplesSettingsCaseStudy"
import { ExamplesSettingsContact } from "@/pages/ExamplesSettingsContact"
import { ExamplesSettingsTerms } from "@/pages/ExamplesSettingsTerms"
import { ExamplesSettingsPolicy from "@/pages/ExamplesSettingsPolicy"
import { ExamplesSettingsAccountSecurity from "@/pages/ExamplesSettingsAccountSecurity"
import { ExamplesSettingsAccountNotifications from "@/pages/ExamplesSettingsAccountNotifications"
import { ExamplesSettingsAccountIntegrations from "@/pages/ExamplesSettingsAccountIntegrations"
import { ExamplesSettingsAccountApi from "@/pages/ExamplesSettingsAccountApi"
import { ExamplesSettingsAccountSettings from "@/pages/ExamplesSettingsAccountSettings"
import { ExamplesSettingsAccountProfile from "@/pages/ExamplesSettingsAccountProfile"
import { ExamplesSettingsAccountEmail from "@/pages/ExamplesSettingsAccountEmail"
import { ExamplesSettingsAccountChat from "@/pages/ExamplesSettingsAccountChat"
import { ExamplesSettingsAccountFile from "@/pages/ExamplesSettingsAccountFile"
import { ExamplesSettingsAccountCalendar from "@/pages/ExamplesSettingsAccountCalendar"
import { ExamplesSettingsAccountInvoice from "@/pages/ExamplesSettingsAccountInvoice"
import { ExamplesSettingsAccountBlog from "@/pages/ExamplesSettingsAccountBlog"
import { ExamplesSettingsAccountPost from "@/pages/ExamplesSettingsAccountPost"
import { ExamplesSettingsAccountPricing from "@/pages/ExamplesSettingsAccountPricing"
import { ExamplesSettingsAccountFaqs from "@/pages/ExamplesSettingsAccountFaqs"
import { ExamplesSettingsAccountTestimonials from "@/pages/ExamplesSettingsAccountTestimonials"
import { ExamplesSettingsAccountReviews from "@/pages/ExamplesSettingsAccountReviews"
import { ExamplesSettingsAccountCareers from "@/pages/ExamplesSettingsAccountCareers"
import { ExamplesSettingsAccountJobs from "@/pages/ExamplesSettingsAccountJobs"
import { ExamplesSettingsAccountJob from "@/pages/ExamplesSettingsAccountJob"
import { ExamplesSettingsAccountCompany from "@/pages/ExamplesSettingsAccountCompany"
import { ExamplesSettingsAccountCaseStudies from "@/pages/ExamplesSettingsAccountCaseStudies"
import { ExamplesSettingsAccountCaseStudy from "@/pages/ExamplesSettingsAccountCaseStudy"
import { ExamplesSettingsAccountContact from "@/pages/ExamplesSettingsAccountContact"
import { ExamplesSettingsAccountTerms from "@/pages/ExamplesSettingsAccountTerms"
import { ExamplesSettingsAccountPolicy from "@/pages/ExamplesSettingsAccountPolicy"
import { AuthProvider } from "@/hooks/useAuth";
import { MobileLayout } from '@/layouts/MobileLayout';
import MobileFlowRoutes from '@/components/mobile/routes/MobileFlowRoutes';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useMobileDashboard } from '@/hooks/useMobileDashboard';
import FundsPage from './pages/mobile/FundsPage';

function App() {
  const [action, setAction] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const { accounts, isLoading: accountsLoading } = useSfdAccounts();
  const { dashboardData, isLoading: dashboardLoading } = useMobileDashboard();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      if (showWelcome) {
        setAction('Welcome');
        navigate('/mobile-flow/welcome');
      } else {
        setAction('Start');
        navigate('/mobile-flow/main');
      }
    }
  }, [user, authLoading, navigate, showWelcome]);

  const handleAction = (action: string, data?: any) => {
    setAction(action);
    console.log(`Action: ${action}`, data);
  };

  const toggleMenu = () => {
    console.log('Toggle menu');
  };

  const handlePaymentSubmit = async (data: { recipient: string, amount: number, note: string }) => {
    console.log('Payment submitted', data);
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "about",
          element: <About />,
        },
        {
          path: "contact",
          element: <Contact />,
        },
        {
          path: "pricing",
          element: <Pricing />,
        },
        {
          path: "terms",
          element: <Terms />,
        },
        {
          path: "policy",
          element: <Policy />,
        },
        {
          path: "docs",
          element: <Docs />,
        },
        {
          path: "docs/:article",
          element: <DocsArticle />,
        },
        {
          path: "examples",
          element: <Examples />,
        },
        {
          path: "examples/table",
          element: <ExamplesTable />,
        },
        {
          path: "examples/kanban",
          element: <ExamplesKanban />,
        },
        {
          path: "examples/tasks",
          element: <ExamplesTasks />,
        },
        {
          path: "examples/settings",
          element: <ExamplesSettings />,
        },
        {
          path: "examples/billing",
          element: <ExamplesBilling />,
        },
        {
          path: "examples/checkout",
          element: <ExamplesCheckout />,
        },
        {
          path: "examples/login",
          element: <ExamplesLogin />,
        },
        {
          path: "examples/register",
          element: <ExamplesRegister />,
        },
        {
          path: "examples/forgot-password",
          element: <ExamplesForgotPassword />,
        },
        {
          path: "examples/new-password",
          element: <ExamplesNewPassword />,
        },
        {
          path: "examples/404",
          element: <Examples404 />,
        },
        {
          path: "examples/500",
          element: <Examples500 />,
        },
        {
          path: "examples/maintenance",
          element: <ExamplesMaintenance />,
        },
        {
          path: "examples/coming-soon",
          element: <ExamplesComingSoon />,
        },
        {
          path: "examples/search",
          element: <ExamplesSearch />,
        },
        {
          path: "examples/email",
          element: <ExamplesEmail />,
        },
        {
          path: "examples/chat",
          element: <ExamplesChat />,
        },
        {
          path: "examples/file",
          element: <ExamplesFile />,
        },
        {
          path: "examples/calendar",
          element: <ExamplesCalendar />,
        },
        {
          path: "examples/profile",
          element: <ExamplesProfile />,
        },
        {
          path: "examples/team",
          element: <ExamplesTeam />,
        },
        {
          path: "examples/invoice",
          element: <ExamplesInvoice />,
        },
        {
          path: "examples/blog",
          element: <ExamplesBlog />,
        },
        {
          path: "examples/post",
          element: <ExamplesPost />,
        },
        {
          path: "examples/pricing",
          element: <ExamplesPricing />,
        },
        {
          path: "examples/faqs",
          element: <ExamplesFaqs />,
        },
        {
          path: "examples/testimonials",
          element: <ExamplesTestimonials />,
        },
        {
          path: "examples/reviews",
          element: <ExamplesReviews />,
        },
        {
          path: "examples/careers",
          element: <ExamplesCareers />,
        },
        {
          path: "examples/jobs",
          element: <ExamplesJobs />,
        },
        {
          path: "examples/job",
          element: <ExamplesJob />,
        },
        {
          path: "examples/company",
          element: <ExamplesCompany />,
        },
        {
          path: "examples/case-studies",
          element: <ExamplesCaseStudies />,
        },
        {
          path: "examples/case-study",
          element: <ExamplesCaseStudy />,
        },
        {
          path: "examples/contact",
          element: <ExamplesContact />,
        },
        {
          path: "examples/terms",
          element: <ExamplesTerms />,
        },
        {
          path: "examples/policy",
          element: <Policy />,
        },
        {
          path: "examples/account",
          element: <ExamplesAccount />,
        },
        {
          path: "examples/security",
          element: <ExamplesSecurity />,
        },
        {
          path: "examples/notifications",
          element: <ExamplesNotifications />,
        },
        {
          path: "examples/integrations",
          element: <ExamplesIntegrations />,
        },
        {
          path: "examples/api",
          element: <ExamplesApi />,
        },
        {
          path: "examples/settings/team",
          element: <ExamplesSettingsTeam />,
        },
        {
          path: "examples/settings/billing",
          element: <ExamplesSettingsBilling />,
        },
        {
          path: "examples/settings/notifications",
          element: <ExamplesSettingsNotifications />,
        },
        {
          path: "examples/settings/security",
          element: <ExamplesSettingsSecurity />,
        },
        {
          path: "examples/settings/integrations",
          element: <ExamplesSettingsIntegrations />,
        },
        {
          path: "examples/settings/api",
          element: <ExamplesSettingsApi />,
        },
        {
          path: "examples/settings/account",
          element: <ExamplesSettingsAccount />,
        },
        {
          path: "examples/settings/profile",
          element: <ExamplesSettingsProfile />,
        },
        {
          path: "examples/settings/email",
          element: <ExamplesSettingsEmail />,
        },
        {
          path: "examples/settings/chat",
          element: <ExamplesSettingsChat />,
        },
        {
          path: "examples/settings/file",
          element: <ExamplesSettingsFile />,
        },
        {
          path: "examples/settings/calendar",
          element: <ExamplesSettingsCalendar />,
        },
        {
          path: "examples/settings/invoice",
          element: <ExamplesSettingsInvoice />,
        },
        {
          path: "examples/settings/blog",
          element: <ExamplesSettingsBlog />,
        },
        {
          path: "examples/settings/post",
          element: <ExamplesSettingsPost />,
        },
        {
          path: "examples/settings/pricing",
          element: <ExamplesSettingsPricing />,
        },
        {
          path: "examples/settings/faqs",
          element: <ExamplesSettingsFaqs />,
        },
        {
          path: "examples/settings/testimonials",
          element: <ExamplesSettingsTestimonials />,
        },
        {
          path: "examples/settings/reviews",
          element: <ExamplesSettingsReviews />,
        },
        {
          path: "examples/settings/careers",
          element: <ExamplesSettingsCareers />,
        },
        {
          path: "examples/settings/jobs",
          element: <ExamplesSettingsJobs />,
        },
        {
          path: "examples/settings/job",
          element: <ExamplesSettingsJob />,
        },
        {
          path: "examples/settings/company",
          element: <ExamplesSettingsCompany />,
        },
        {
          path: "examples/settings/case-studies",
          element: <ExamplesSettingsCaseStudies />,
        },
        {
          path: "examples/settings/case-study",
          element: <ExamplesSettingsCaseStudy />,
        },
        {
          path: "examples/settings/contact",
          element: <ExamplesSettingsContact />,
        },
        {
          path: "examples/settings/terms",
          element: <ExamplesSettingsTerms />,
        },
        {
          path: "examples/settings/policy",
          element: <ExamplesSettingsPolicy />,
        },
        {
          path: "examples/account/security",
          element: <ExamplesSettingsAccountSecurity />,
        },
        {
          path: "examples/account/notifications",
          element: <ExamplesSettingsAccountNotifications />,
        },
        {
          path: "examples/account/integrations",
          element: <ExamplesSettingsAccountIntegrations />,
        },
        {
          path: "examples/account/api",
          element: <ExamplesSettingsAccountApi />,
        },
		{
          path: "examples/account/settings",
          element: <ExamplesSettingsAccountSettings />,
        },
		{
          path: "examples/account/profile",
          element: <ExamplesSettingsAccountProfile />,
        },
		{
          path: "examples/account/email",
          element: <ExamplesSettingsAccountEmail />,
        },
		{
          path: "examples/account/chat",
          element: <ExamplesSettingsAccountChat />,
        },
		{
          path: "examples/account/file",
          element: <ExamplesSettingsAccountFile />,
        },
		{
          path: "examples/account/calendar",
          element: <ExamplesSettingsAccountCalendar />,
        },
		{
          path: "examples/account/invoice",
          element: <ExamplesSettingsAccountInvoice />,
        },
		{
          path: "examples/account/blog",
          element: <ExamplesSettingsAccountBlog />,
        },
		{
          path: "examples/account/post",
          element: <ExamplesSettingsAccountPost />,
        },
		{
          path: "examples/account/pricing",
          element: <ExamplesSettingsAccountPricing />,
        },
		{
          path: "examples/account/faqs",
          element: <ExamplesSettingsAccountFaqs />,
        },
		{
          path: "examples/account/testimonials",
          element: <ExamplesSettingsAccountTestimonials />,
        },
		{
          path: "examples/account/reviews",
          element: <ExamplesSettingsAccountReviews />,
        },
		{
          path: "examples/account/careers",
          element: <ExamplesSettingsAccountCareers />,
        },
		{
          path: "examples/account/jobs",
          element: <ExamplesSettingsAccountJobs />,
        },
		{
          path: "examples/account/job",
          element: <ExamplesSettingsAccountJob />,
        },
		{
          path: "examples/account/company",
          element: <ExamplesSettingsAccountCompany />,
        },
		{
          path: "examples/account/case-studies",
          element: <ExamplesSettingsAccountCaseStudies />,
        },
		{
          path: "examples/account/case-study",
          element: <ExamplesSettingsAccountCaseStudy />,
        },
		{
          path: "examples/account/contact",
          element: <ExamplesSettingsAccountContact />,
        },
		{
          path: "examples/account/terms",
          element: <ExamplesSettingsAccountTerms />,
        },
		{
          path: "examples/account/policy",
          element: <ExamplesSettingsAccountPolicy />,
        },
      ],
    },
    {
      path: "/mobile-flow",
      element: (
        <AuthProvider>
          <MobileLayout>
            <MobileFlowRoutes
              onAction={handleAction}
              account={dashboardData?.account || null}
              transactions={dashboardData?.transactions || []}
              transactionsLoading={dashboardLoading}
              toggleMenu={toggleMenu}
              showWelcome={showWelcome}
              setShowWelcome={setShowWelcome}
              handlePaymentSubmit={handlePaymentSubmit}
            />
          </MobileLayout>
        </AuthProvider>
      ),
      children: [],
    },
    {
      path: "/mobile-flow/funds-management",
      element: <FundsPage />
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
