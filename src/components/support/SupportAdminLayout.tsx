import { Outlet } from 'react-router-dom';
import SupportAdminSidebar from './SupportAdminSidebar';

const SupportAdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <SupportAdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SupportAdminLayout;
