
import { NavigateFunction } from 'react-router-dom';

export const redirectToMobile = (navigate: NavigateFunction) => {
  // Check if the user is already on the mobile flow
  const currentPath = window.location.pathname;
  if (!currentPath.includes('/mobile-flow')) {
    navigate('/mobile-flow/main');
  }
};

export const redirectToAuth = (navigate: NavigateFunction) => {
  navigate('/login');
};
