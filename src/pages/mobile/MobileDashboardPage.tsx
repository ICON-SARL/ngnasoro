import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileDashboard from '@/components/mobile/dashboard/MobileDashboard';

const MobileDashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedApp');
    if (!hasVisited) {
      navigate('/mobile-flow/welcome', { replace: true });
    }
  }, [navigate]);

  return <MobileDashboard />;
};

export default MobileDashboardPage;
