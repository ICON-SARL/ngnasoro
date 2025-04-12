
import express from 'express';
import { isSuperAdmin, hasPermissions, hasSfdManagementPermissions } from '@/utils/middlewares/authMiddleware';
import { PERMISSIONS } from '@/utils/auth/roleTypes';

const router = express.Router();

// Route protégée par le middleware isSuperAdmin
router.get('/admin-dashboard', isSuperAdmin, (req, res) => {
  res.json({ message: "Accès au tableau de bord administrateur autorisé" });
});

// Route protégée nécessitant les permissions spécifiques de création SFD
router.post('/sfds', hasPermissions([PERMISSIONS.CREATE_SFD]), (req, res) => {
  res.json({ message: "Création de SFD autorisée" });
});

// Route protégée nécessitant la permission de créer un admin SFD
router.post('/sfd-admins', hasPermissions([PERMISSIONS.CREATE_SFD_ADMIN]), (req, res) => {
  res.json({ message: "Création d'administrateur SFD autorisée" });
});

// Route protégée nécessitant la permission d'audit des rapports
router.get('/audit-reports', hasPermissions([PERMISSIONS.AUDIT_REPORTS]), (req, res) => {
  res.json({ message: "Accès aux rapports d'audit autorisé" });
});

// Route utilisant le middleware combiné pour la gestion complète des SFDs
router.post('/sfd-management', hasSfdManagementPermissions, (req, res) => {
  res.json({ message: "Accès à la gestion complète des SFDs autorisé" });
});

export default router;
