
import { NavigateFunction } from 'react-router-dom';

export const redirectToMobile = (navigate: NavigateFunction) => {
  navigate('/mobile-flow/main');
};

export const redirectToAuth = (navigate: NavigateFunction) => {
  navigate('/login');
};

export const redirectToCapacitorGuide = (navigate: NavigateFunction) => {
  navigate('/capacitor-guide');
};

// Add new admin specific navigation functions
export const redirectToAdminDashboard = (navigate: NavigateFunction) => {
  navigate('/super-admin-dashboard');
};

export const redirectToSfdManagement = (navigate: NavigateFunction) => {
  navigate('/sfd-management');
};

export const redirectToUserManagement = (navigate: NavigateFunction) => {
  navigate('/admin/users');
};

export const redirectToSfdAdminDashboard = (navigate: NavigateFunction) => {
  navigate('/agency-dashboard');
};
