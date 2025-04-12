
import { UserRole, PERMISSIONS } from '@/utils/auth/roleTypes';
import { logAuditEvent, AuditLogCategory, AuditLogSeverity } from '@/utils/audit';

/**
 * Middleware to check if a user has SUPER_ADMIN role
 */
export const isSuperAdmin = (req: any, res: any, next: () => void) => {
  // Vérifier si l'utilisateur existe
  if (!req.user) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }
  
  // Vérifier si le rôle existe
  if (!req.user.role) {
    return res.status(403).json({ error: "Rôle utilisateur non défini" });
  }
  
  // Vérifier si l'utilisateur est un SUPER_ADMIN (valeur 'admin' dans le système)
  if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== "admin") {
    // Journalisation de la tentative d'accès non autorisée
    logAuditEvent({
      user_id: req.user.id || 'unknown',
      action: 'unauthorized_admin_access',
      category: AuditLogCategory.SECURITY,
      severity: AuditLogSeverity.WARNING,
      status: 'failure',
      target_resource: req.originalUrl || 'admin_route',
      details: {
        required_role: 'admin',
        user_role: req.user.role,
        timestamp: new Date().toISOString()
      },
      error_message: "Tentative d'accès à une route administrateur restreinte"
    }).catch(err => console.error('Error logging audit event:', err));
    
    return res.status(403).json({ error: "Accès refusé - Droits administrateur requis" });
  }
  
  // Accès autorisé, on continue
  next();
};

/**
 * Middleware pour vérifier les permissions spécifiques
 * @param permissions Liste des permissions requises
 */
export const hasPermissions = (permissions: string[]) => {
  return (req: any, res: any, next: () => void) => {
    // Vérifier si l'utilisateur existe
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }
    
    // Récupérer le rôle de l'utilisateur
    const userRole = req.user.role;
    
    // Vérifier si le rôle existe
    if (!userRole) {
      return res.status(403).json({ error: "Rôle utilisateur non défini" });
    }
    
    // Pour les SUPER_ADMIN, autoriser automatiquement toutes les permissions
    if (userRole === UserRole.SUPER_ADMIN || userRole === "admin") {
      return next();
    }
    
    // Récupérer les permissions associées au rôle de l'utilisateur
    const userPermissions = req.user.permissions || [];
    
    // Vérifier si l'utilisateur a toutes les permissions requises
    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      // Journalisation de la tentative d'accès non autorisée
      logAuditEvent({
        user_id: req.user.id || 'unknown',
        action: 'permission_denied',
        category: AuditLogCategory.SECURITY,
        severity: AuditLogSeverity.WARNING,
        status: 'failure',
        target_resource: req.originalUrl || 'protected_route',
        details: {
          required_permissions: permissions,
          user_permissions: userPermissions,
          user_role: userRole,
          timestamp: new Date().toISOString()
        },
        error_message: "Accès refusé - Permissions requises manquantes"
      }).catch(err => console.error('Error logging audit event:', err));
      
      return res.status(403).json({ 
        error: "Accès refusé - Permissions requises", 
        required: permissions 
      });
    }
    
    // Accès autorisé, on continue
    next();
  };
};

/**
 * Middleware pour vérifier les permissions spécifiques de gestion SFD
 */
export const hasSfdManagementPermissions = (req: any, res: any, next: () => void) => {
  return hasPermissions([
    PERMISSIONS.CREATE_SFD,
    PERMISSIONS.CREATE_SFD_ADMIN,
    PERMISSIONS.AUDIT_REPORTS
  ])(req, res, next);
};
