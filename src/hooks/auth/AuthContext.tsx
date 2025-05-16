
// Helper function to convert string role to UserRole enum
function stringToUserRole(role: string): UserRole | null {
  if (!role) return null;
  
  switch(role.toLowerCase()) {
    case 'admin':
      return UserRole.Admin;
    case 'sfd_admin':
      return UserRole.SfdAdmin;
    case 'client':
      return UserRole.Client;
    case 'user':
      return UserRole.User;
    default:
      return null;
  }
}
