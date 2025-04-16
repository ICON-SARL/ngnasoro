
interface Window {
  activateSystem: () => Promise<{
    success: boolean;
    data?: { message: string };
    error?: any;
  }>;
  synchronizeUserRoles: () => Promise<{
    success: boolean;
    data?: { message: string };
    error?: any;
  }>;
}
