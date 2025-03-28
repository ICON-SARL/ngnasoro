
import { NavigateFunction } from 'react-router-dom';

export const redirectToMobile = (navigate: NavigateFunction) => {
  navigate('/mobile-flow/main');
};

export const redirectToAuth = (navigate: NavigateFunction) => {
  navigate('/login');
};
