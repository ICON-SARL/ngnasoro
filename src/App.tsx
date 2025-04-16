import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/layout';
import { Dashboard } from '@/components/dashboard/dashboard';
import { Auth } from '@/pages/Auth';
import { ProfilePage } from '@/pages/ProfilePage';
import { ClientLoansPage } from '@/pages/ClientLoansPage';
import { SfdLoansPage } from '@/pages/SfdLoansPage';
import { SfdClientsPage } from '@/pages/SfdClientsPage';
import { SfdSubsidiesPage } from '@/pages/SfdSubsidiesPage';
import { SfdUsersPage } from '@/pages/SfdUsersPage';
import { SfdSettingsPage } from '@/pages/SfdSettingsPage';
import { SfdLoanProductsPage } from '@/pages/SfdLoanProductsPage';
import { SfdLoanRepaymentsPage } from '@/pages/SfdLoanRepaymentsPage';
import { SfdLoanDisbursementsPage } from '@/pages/SfdLoanDisbursementsPage';
import { SfdLoanApplicationsPage } from '@/pages/SfdLoanApplicationsPage';
import { SfdLoanDefaultedPage } from '@/pages/SfdLoanDefaultedPage';
import { SfdLoanWriteOffsPage } from '@/pages/SfdLoanWriteOffsPage';
import { SfdLoanReschedulingPage } from '@/pages/SfdLoanReschedulingPage';
import { SfdLoanGuaranteesPage } from '@/pages/SfdLoanGuaranteesPage';
import { SfdLoanCollateralPage } from '@/pages/SfdLoanCollateralPage';
import { SfdLoanInsurancePage } from '@/pages/SfdLoanInsurancePage';
import { SfdLoanSavingsPage } from '@/pages/SfdLoanSavingsPage';
import { SfdLoanChargesPage } from '@/pages/SfdLoanChargesPage';
import { SfdLoanAccountingPage } from '@/pages/SfdLoanAccountingPage';
import { SfdLoanReportsPage } from '@/pages/SfdLoanReportsPage';
import { SfdLoanAuditPage } from '@/pages/SfdLoanAuditPage';
import { SfdLoanCompliancePage } from '@/pages/SfdLoanCompliancePage';
import { SfdLoanRiskPage } from '@/pages/SfdLoanRiskPage';
import { SfdLoanPortfolioPage } from '@/pages/SfdLoanPortfolioPage';
import { SfdLoanDelinquencyPage } from '@/pages/SfdLoanDelinquencyPage';
import { SfdLoanRestructuringPage } from '@/pages/SfdLoanRestructuringPage';
import { SfdLoanRecoveryPage } from '@/pages/SfdLoanRecoveryPage';
import { SfdLoanLegalPage } from '@/pages/SfdLoanLegalPage';
import { SfdLoanCollectionsPage } from '@/pages/SfdLoanCollectionsPage';
import { SfdLoanCustomerServicePage } from '@/pages/SfdLoanCustomerServicePage';
import { SfdLoanTrainingPage } from '@/pages/SfdLoanTrainingPage';
import { SfdLoanMarketingPage } from '@/pages/SfdLoanMarketingPage';
import { SfdLoanTechnologyPage } from '@/pages/SfdLoanTechnologyPage';
import { SfdLoanOperationsPage } from '@/pages/SfdLoanOperationsPage';
import { SfdLoanHumanResourcesPage } from '@/pages/SfdLoanHumanResourcesPage';
import { SfdLoanFinancePage } from '@/pages/SfdLoanFinancePage';
import { SfdLoanAdministrationPage } from '@/pages/SfdLoanAdministrationPage';
import { SfdLoanBoardPage } from '@/pages/SfdLoanBoardPage';
import { SfdLoanManagementPage } from '@/pages/SfdLoanManagementPage';
import { SfdLoanCreditCommitteePage } from '@/pages/SfdLoanCreditCommitteePage';
import { SfdLoanInternalAuditPage } from '@/pages/SfdLoanInternalAuditPage';
import { SfdLoanExternalAuditPage } from '@/pages/SfdLoanExternalAuditPage';
import { SfdLoanRegulatoryReportingPage } from '@/pages/SfdLoanRegulatoryReportingPage';
import { SfdLoanDataAnalyticsPage } from '@/pages/SfdLoanDataAnalyticsPage';
import { SfdLoanInnovationPage } from '@/pages/SfdLoanInnovationPage';
import { SfdLoanSustainabilityPage } from '@/pages/SfdLoanSustainabilityPage';
import { SfdLoanImpactAssessmentPage } from '@/pages/SfdLoanImpactAssessmentPage';
import { SfdLoanCommunityEngagementPage } from '@/pages/SfdLoanCommunityEngagementPage';
import { SfdLoanPartnershipsPage } from '@/pages/SfdLoanPartnershipsPage';
import { SfdLoanGovernancePage } from '@/pages/SfdLoanGovernancePage';
import { SfdLoanStrategyPage } from '@/pages/SfdLoanStrategyPage';
import { SfdLoanPerformancePage } from '@/pages/SfdLoanPerformancePage';
import { SfdLoanRiskManagementPage } from '@/pages/SfdLoanRiskManagementPage';
import { SfdLoanComplianceManagementPage } from '@/pages/SfdLoanComplianceManagementPage';
import { SfdLoanQualityAssurancePage } from '@/pages/SfdLoanQualityAssurancePage';
import { SfdLoanTrainingDevelopmentPage } from '@/pages/SfdLoanTrainingDevelopmentPage';
import { SfdLoanSuccessionPlanningPage } from '@/pages/SfdLoanSuccessionPlanningPage';
import { SfdLoanChangeManagementPage } from '@/pages/SfdLoanChangeManagementPage';
import { SfdLoanKnowledgeManagementPage } from '@/pages/SfdLoanKnowledgeManagementPage';
import { SfdLoanStakeholderRelationsPage } from '@/pages/SfdLoanStakeholderRelationsPage';
import { SfdLoanCrisisManagementPage } from '@/pages/SfdLoanCrisisManagementPage';
import { SfdLoanBusinessContinuityPage } from '@/pages/SfdLoanBusinessContinuityPage';
import { SfdLoanEnvironmentalSocialGovernancePage } from '@/pages/SfdLoanEnvironmentalSocialGovernancePage';
import { SfdLoanDigitalTransformationPage } from '@/pages/SfdLoanDigitalTransformationPage';
import { SfdLoanFinancialInclusionPage } from '@/pages/SfdLoanFinancialInclusionPage';
import { SfdLoanPovertyReductionPage } from '@/pages/SfdLoanPovertyReductionPage';
import { SfdLoanEmpowermentPage } from '@/pages/SfdLoanEmpowermentPage';
import { SfdLoanEconomicDevelopmentPage } from '@/pages/SfdLoanEconomicDevelopmentPage';
import { SfdLoanSocialImpactPage } from '@/pages/SfdLoanSocialImpactPage';
import { SfdLoanInnovationTechnologyPage } from '@/pages/SfdLoanInnovationTechnologyPage';
import { SfdLoanSustainabilityPracticesPage } from '@/pages/SfdLoanSustainabilityPracticesPage';
import { SfdLoanCommunityDevelopmentPage } from '@/pages/SfdLoanCommunityDevelopmentPage';
import { SfdLoanEthicalPracticesPage } from '@/pages/SfdLoanEthicalPracticesPage';
import { SfdLoanTransparencyAccountabilityPage } from '@/pages/SfdLoanTransparencyAccountabilityPage';
import { SfdLoanClientProtectionPage } from '@/pages/SfdLoanClientProtectionPage';
import { SfdLoanDataPrivacyPage } from '@/pages/SfdLoanDataPrivacyPage';
import { SfdLoanCybersecurityPage } from '@/pages/SfdLoanCybersecurityPage';
import { SfdLoanRiskAssessmentPage } from '@/pages/SfdLoanRiskAssessmentPage';
import { SfdLoanInternalControlsPage } from '@/pages/SfdLoanInternalControlsPage';
import { SfdLoanFraudPreventionPage } from '@/pages/SfdLoanFraudPreventionPage';
import { SfdLoanDisasterRecoveryPage } from '@/pages/SfdLoanDisasterRecoveryPage';
import { SfdLoanComplianceMonitoringPage } from '@/pages/SfdLoanComplianceMonitoringPage';
import { SfdLoanRegulatoryReportingCompliancePage } from '@/pages/SfdLoanRegulatoryReportingCompliancePage';
import { SfdLoanAuditTrailPage } from '@/pages/SfdLoanAuditTrailPage';
import { SfdLoanWhistleblowerProtectionPage } from '@/pages/SfdLoanWhistleblowerProtectionPage';
import { SfdLoanCodeOfConductPage } from '@/pages/SfdLoanCodeOfConductPage';
import { SfdLoanEthicsTrainingPage } from '@/pages/SfdLoanEthicsTrainingPage';
import { SfdLoanConflictOfInterestPage } from '@/pages/SfdLoanConflictOfInterestPage';
import { SfdLoanAntiCorruptionPage } from '@/pages/SfdLoanAntiCorruptionPage';
import { SfdLoanAntiMoneyLaunderingPage } from '@/pages/SfdLoanAntiMoneyLaunderingPage';
import { SfdLoanCombatingTerroristFinancingPage } from '@/pages/SfdLoanCombatingTerroristFinancingPage';
import { SfdLoanSanctionsCompliancePage } from '@/pages/SfdLoanSanctionsCompliancePage';
import { SfdLoanKnowYourCustomerPage } from '@/pages/SfdLoanKnowYourCustomerPage';
import { SfdLoanEnhancedDueDiligencePage } from '@/pages/SfdLoanEnhancedDueDiligencePage';
import { SfdLoanPoliticallyExposedPersonsPage } from '@/pages/SfdLoanPoliticallyExposedPersonsPage';
import { SfdLoanTransactionMonitoringPage } from '@/pages/SfdLoanTransactionMonitoringPage';
import { SfdLoanSuspiciousActivityReportingPage } from '@/pages/SfdLoanSuspiciousActivityReportingPage';
import { SfdLoanRegulatoryInspectionsPage } from '@/pages/SfdLoanRegulatoryInspectionsPage';
import { SfdLoanCorrectiveActionsPage } from '@/pages/SfdLoanCorrectiveActionsPage';
import { SfdLoanContinuousImprovementPage } from '@/pages/SfdLoanContinuousImprovementPage';
import { SfdLoanDataDrivenDecisionMakingPage } from '@/pages/SfdLoanDataDrivenDecisionMakingPage';
import { SfdLoanPerformanceMetricsPage } from '@/pages/SfdLoanPerformanceMetricsPage';
import { SfdLoanDataVisualizationPage } from '@/pages/SfdLoanDataVisualizationPage';
import { SfdLoanDataQualityPage } from '@/pages/SfdLoanDataQualityPage';
import { SfdLoanDataGovernancePage } from '@/pages/SfdLoanDataGovernancePage';
import { SfdLoanDataSecurityPage } from '@/pages/SfdLoanDataSecurityPage';
import { SfdLoanDataAnalysisPage } from '@/pages/SfdLoanDataAnalysisPage';
import { SfdLoanReportingAutomationPage } from '@/pages/SfdLoanReportingAutomationPage';
import { SfdLoanArtificialIntelligencePage } from '@/pages/SfdLoanArtificialIntelligencePage';
import { SfdLoanMachineLearningPage } from '@/pages/SfdLoanMachineLearningPage';
import { SfdLoanBigDataPage } from '@/pages/SfdLoanBigDataPage';
import { SfdLoanCloudComputingPage } from '@/pages/SfdLoanCloudComputingPage';
import { SfdLoanMobileTechnologyPage } from '@/pages/SfdLoanMobileTechnologyPage';
import { SfdLoanBlockchainTechnologyPage } from '@/pages/SfdLoanBlockchainTechnologyPage';
import { SfdLoanInternetOfThingsPage } from '@/pages/SfdLoanInternetOfThingsPage';
import { SfdLoanAutomationRoboticsPage } from '@/pages/SfdLoanAutomationRoboticsPage';
import { SfdLoanDigitalIdentityPage } from '@/pages/SfdLoanDigitalIdentityPage';
import { SfdLoanCybersecurityMeasuresPage } from '@/pages/SfdLoanCybersecurityMeasuresPage';
import { SfdLoanDataEncryptionPage } from '@/pages/SfdLoanDataEncryptionPage';
import { SfdLoanAccessControlsPage } from '@/pages/SfdLoanAccessControlsPage';
import { SfdLoanVulnerabilityManagementPage } from '@/pages/SfdLoanVulnerabilityManagementPage';
import { SfdLoanIncidentResponsePage } from '@/pages/SfdLoanIncidentResponsePage';
import { SfdLoanSecurityAwarenessTrainingPage } from '@/pages/SfdLoanSecurityAwarenessTrainingPage';
import { SfdLoanThirdPartyRiskManagementPage } from '@/pages/SfdLoanThirdPartyRiskManagementPage';
import { SfdLoanBusinessContinuityPlanningPage } from '@/pages/SfdLoanBusinessContinuityPlanningPage';
import { SfdLoanDisasterRecoveryTestingPage } from '@/pages/SfdLoanDisasterRecoveryTestingPage';
import { SfdLoanCrisisCommunicationPage } from '@/pages/SfdLoanCrisisCommunicationPage';
import { SfdLoanStakeholderEngagementPage } from '@/pages/SfdLoanStakeholderEngagementPage';
import { SfdLoanCommunityOutreachPage } from '@/pages/SfdLoanCommunityOutreachPage';
import { SfdLoanVolunteerProgramsPage } from '@/pages/SfdLoanVolunteerProgramsPage';
import { SfdLoanPhilanthropyPage } from '@/pages/SfdLoanPhilanthropyPage';
import { SfdLoanSocialResponsibilityPage } from '@/pages/SfdLoanSocialResponsibilityPage';
import { SfdLoanEnvironmentalSustainabilityPage } from '@/pages/SfdLoanEnvironmentalSustainabilityPage';
import { SfdLoanGreenFinancePage } from '@/pages/SfdLoanGreenFinancePage';
import { SfdLoanRenewableEnergyPage } from '@/pages/SfdLoanRenewableEnergyPage';
import { SfdLoanSustainableAgriculturePage } from '@/pages/SfdLoanSustainableAgriculturePage';
import { SfdLoanClimateResiliencePage } from '@/pages/SfdLoanClimateResiliencePage';
import { SfdLoanImpactInvestingPage } from '@/pages/SfdLoanImpactInvestingPage';
import { SfdLoanSocialEnterprisePage } from '@/pages/SfdLoanSocialEnterprisePage';
import { SfdLoanMicrofinancePage } from '@/pages/SfdLoanMicrofinancePage';
import { SfdLoanFinancialLiteracyPage } from '@/pages/SfdLoanFinancialLiteracyPage';
import { SfdLoanJobCreationPage } from '@/pages/SfdLoanJobCreationPage';
import { SfdLoanEconomicGrowthPage } from '@/pages/SfdLoanEconomicGrowthPage';
import { SfdLoanPovertyAlleviationPage } from '@/pages/SfdLoanPovertyAlleviationPage';
import { SfdLoanEmpowermentProgramsPage } from '@/pages/SfdLoanEmpowermentProgramsPage';
import { SfdLoanCommunityDevelopmentProjectsPage } from '@/pages/SfdLoanCommunityDevelopmentProjectsPage';
import { SfdLoanEthicalSourcingPage } from '@/pages/SfdLoanEthicalSourcingPage';
import { SfdLoanFairTradePracticesPage } from '@/pages/SfdLoanFairTradePracticesPage';
import { SfdLoanResponsibleLendingPage } from '@/pages/SfdLoanResponsibleLendingPage';
import { SfdLoanClientRightsPage } from '@/pages/SfdLoanClientRightsPage';
import { SfdLoanDataProtectionMeasuresPage } from '@/pages/SfdLoanDataProtectionMeasuresPage';
import { SfdLoanPrivacyPoliciesPage } from '@/pages/SfdLoanPrivacyPoliciesPage';
import { SfdLoanDataBreachResponsePage } from '@/pages/SfdLoanDataBreachResponsePage';
import { SfdLoanTransparencyReportingPage } from '@/pages/SfdLoanTransparencyReportingPage';
import { SfdLoanAccountabilityMechanismsPage } from '@/pages/SfdLoanAccountabilityMechanismsPage';
import { SfdLoanAuditCommitteePage } from '@/pages/SfdLoanAuditCommitteePage';
import { SfdLoanInternalAuditFunctionPage } from '@/pages/SfdLoanInternalAuditFunctionPage';
import { SfdLoanExternalAuditEngagementPage } from '@/pages/SfdLoanExternalAuditEngagementPage';
import { SfdLoanRegulatoryComplianceFrameworkPage } from '@/pages/SfdLoanRegulatoryComplianceFrameworkPage';
import { SfdLoanComplianceTrainingProgramsPage } from '@/pages/SfdLoanComplianceTrainingProgramsPage';
import { SfdLoanEthicsHotlinePage } from '@/pages/SfdLoanEthicsHotlinePage';
import { SfdLoanWhistleblowerProtectionPolicyPage } from '@/pages/SfdLoanWhistleblowerProtectionPolicyPage';
import { SfdLoanCodeOfEthicsPage } from '@/pages/SfdLoanCodeOfEthicsPage';
import { SfdLoanConflictOfInterestPolicyPage } from '@/pages/SfdLoanConflictOfInterestPolicyPage';
import { SfdLoanAntiCorruptionPolicyPage } from '@/pages/SfdLoanAntiCorruptionPolicyPage';
import { SfdLoanAntiMoneyLaunderingCompliancePage } from '@/pages/SfdLoanAntiMoneyLaunderingCompliancePage';
import { SfdLoanCombatingTerroristFinancingMeasuresPage } from '@/pages/SfdLoanCombatingTerroristFinancingMeasuresPage';
import { SfdLoanSanctionsScreeningPage } from '@/pages/SfdLoanSanctionsScreeningPage';
import { SfdLoanCustomerDueDiligencePage } from '@/pages/SfdLoanCustomerDueDiligencePage';
import { SfdLoanEnhancedCustomerDueDiligencePage } from '@/pages/SfdLoanEnhancedCustomerDueDiligencePage';
import { SfdLoanPoliticallyExposedPersonsScreeningPage } from '@/pages/SfdLoanPoliticallyExposedPersonsScreeningPage';
import { SfdLoanTransactionMonitoringSystemsPage } from '@/pages/SfdLoanTransactionMonitoringSystemsPage';
import { SfdLoanSuspiciousActivityReportingProceduresPage } from '@/pages/SfdLoanSuspiciousActivityReportingProceduresPage';
import { SfdLoanRegulatoryReportingRequirementsPage } from '@/pages/SfdLoanRegulatoryReportingRequirementsPage';
import { SfdLoanCorrectiveActionPlansPage } from '@/pages/SfdLoanCorrectiveActionPlansPage';
import { SfdLoanContinuousImprovementProcessesPage } from '@/pages/SfdLoanContinuousImprovementProcessesPage';
import { SfdAdminPage } from '@/pages/SfdAdminPage';
import { MobileLoansPage } from '@/pages/mobile/MobileLoansPage';
import { MobileProfilePage } from '@/pages/mobile/MobileProfilePage';
import { MobileEditProfilePage } from '@/pages/mobile/MobileEditProfilePage';
import { MobileLoanApplicationPage } from '@/pages/mobile/MobileLoanApplicationPage';
import { MobileLoanProcessPage } from '@/pages/mobile/MobileLoanProcessPage';
import { MobileLoanPlansPage } from '@/pages/mobile/MobileLoanPlansPage';
import LoanProcessFlow from '@/components/mobile/LoanProcessFlow';
import { MobileSelectSfdPage } from '@/pages/mobile/MobileSelectSfdPage';
import { MobileNotificationsPage } from '@/pages/mobile/MobileNotificationsPage';
import { MobileSettingsPage } from '@/pages/mobile/MobileSettingsPage';
import { MobileHelpPage } from '@/pages/mobile/MobileHelpPage';
import { MobileTermsPage } from '@/pages/mobile/MobileTermsPage';
import { MobilePersonalInfoPage } from '@/pages/mobile/profile/MobilePersonalInfoPage';
import { MobileSecurityPage } from '@/pages/mobile/profile/MobileSecurityPage';
import { MobileNotificationsSettingsPage } from '@/pages/mobile/profile/MobileNotificationsSettingsPage';
import { SfdActivationPage } from '@/pages/SfdActivationPage';
import { MerefLoanRequestsPage } from '@/pages/MerefLoanRequestsPage';
import { MerefTransactionsPage } from '@/pages/MerefTransactionsPage';
import { SfdLoanPlansPage } from '@/pages/SfdLoanPlansPage';
import { SfdLoanPlanDetailsPage } from '@/pages/SfdLoanPlanDetailsPage';
import { SfdLoanPlanEditPage } from '@/pages/SfdLoanPlanEditPage';
import { SfdLoanPlanCreatePage } from '@/pages/SfdLoanPlanCreatePage';
import { SfdLoanPlanDeletePage } from '@/pages/SfdLoanPlanDeletePage';
import { SfdLoanPlanPublishPage } from '@/pages/SfdLoanPlanPublishPage';
import { SfdLoanPlanUnpublishPage } from '@/pages/SfdLoanPlanUnpublishPage';
import { SfdLoanPlanActivatePage } from '@/pages/SfdLoanPlanActivatePage';
import { SfdLoanPlanDeactivatePage } from '@/pages/SfdLoanPlanDeactivatePage';
import { SfdLoanPlanApprovePage } from '@/pages/SfdLoanPlanApprovePage';
import { SfdLoanPlanRejectPage } from '@/pages/SfdLoanPlanRejectPage';
import { SfdLoanPlanSubmitPage } from '@/pages/SfdLoanPlanSubmitPage';
import { SfdLoanPlanWithdrawPage } from '@/pages/SfdLoanPlanWithdrawPage';
import { SfdLoanPlanCompletePage } from '@/pages/SfdLoanPlanCompletePage';
import { SfdLoanPlanArchivePage } from '@/pages/SfdLoanPlanArchivePage';
import { SfdLoanPlanUnarchivePage } from '@/pages/SfdLoanPlanUnarchivePage';
import { SfdLoanPlanRestorePage } from '@/pages/SfdLoanPlanRestorePage';
import { SfdLoanPlanClonePage } from '@/pages/SfdLoanPlanClonePage';
import { SfdLoanPlanMergePage } from '@/pages/SfdLoanPlanMergePage';
import { SfdLoanPlanSplitPage } from '@/pages/SfdLoanPlanSplitPage';
import { SfdLoanPlanConsolidatePage } from '@/pages/SfdLoanPlanConsolidatePage';
import { SfdLoanPlanTransferPage } from '@/pages/SfdLoanPlanTransferPage';
import { SfdLoanPlanAssignPage } from '@/pages/SfdLoanPlanAssignPage';
import { SfdLoanPlanUnassignPage } from '@/pages/SfdLoanPlanUnassignPage';
import { SfdLoanPlanEscalatePage } from '@/pages/SfdLoanPlanEscalatePage';
import { SfdLoanPlanDeescalatePage } from '@/pages/SfdLoanPlanDeescalatePage';
import { SfdLoanPlanCommentPage } from '@/pages/SfdLoanPlanCommentPage';
import { SfdLoanPlanLogPage } from '@/pages/SfdLoanPlanLogPage';
import { SfdLoanPlanHistoryPage } from '@/pages/SfdLoanPlanHistoryPage';
import { SfdLoanPlanAttachmentPage } from '@/pages/SfdLoanPlanAttachmentPage';
import { SfdLoanPlanChecklistPage } from '@/pages/SfdLoanPlanChecklistPage';
import { SfdLoanPlanApprovalWorkflowPage } from '@/pages/SfdLoanPlanApprovalWorkflowPage';
import { SfdLoanPlanRiskAssessmentMatrixPage } from '@/pages/SfdLoanPlanRiskAssessmentMatrixPage';
import { SfdLoanPlanImpactAssessmentReportPage } from '@/pages/SfdLoanPlanImpactAssessmentReportPage';
import { SfdLoanPlanFinancialAnalysisPage } from '@/pages/SfdLoanPlanFinancialAnalysisPage';
import { SfdLoanPlanMarketAnalysisPage } from '@/pages/SfdLoanPlanMarketAnalysisPage';
import { SfdLoanPlanSocialImpactAnalysisPage } from '@/pages/SfdLoanSocialImpactAnalysisPage';
import { SfdLoanPlanEnvironmentalImpactAnalysisPage } from '@/pages/SfdLoanPlanEnvironmentalImpactAnalysisPage';
import { SfdLoanPlanEconomicImpactAnalysisPage } from '@/pages/SfdLoanPlanEconomicImpactAnalysisPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { UserRole } from '@/utils/auth/roleTypes';

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={<Auth />} />

      {/* Main layout with dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Client-specific routes */}
      <Route
        path="/client/loans"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientLoansPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* SFD-specific routes */}
      <Route
        path="/sfd/loans"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoansPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/clients"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdClientsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/subsidies"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdSubsidiesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/users"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdUsersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/settings"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdSettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-products"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanProductsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-repayments"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanRepaymentsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-disbursements"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanDisbursementsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-applications"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanApplicationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-defaulted"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanDefaultedPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-write-offs"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanWriteOffsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-rescheduling"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanReschedulingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-guarantees"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanGuaranteesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-collateral"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanCollateralPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-insurance"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanInsurancePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-savings"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanSavingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-charges"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanChargesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-accounting"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanAccountingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-reports"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-audit"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanAuditPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-compliance"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanCompliancePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-risk"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanRiskPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-portfolio"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanPortfolioPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-delinquency"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanDelinquencyPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-restructuring"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanRestructuringPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-recovery"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanRecoveryPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-legal"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanLegalPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-collections"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanCollectionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-customer-service"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanCustomerServicePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-training"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanTrainingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-marketing"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanMarketingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-technology"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanTechnologyPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-operations"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanOperationsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-human-resources"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanHumanResourcesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-finance"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanFinancePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-administration"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanAdministrationPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-board"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanBoardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-management"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanManagementPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-credit-committee"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanCreditCommitteePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-internal-audit"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanInternalAuditPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-external-audit"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanExternalAuditPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-regulatory-reporting"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SFDAdmin]}>
            <Layout>
              <SfdLoanRegulatoryReportingPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sfd/loan-data-analytics"
        element={
