
# Cas de Tests par Rôle Utilisateur

Ce document décrit les cas de test pour les différents rôles utilisateurs dans l'application.

## Super Admin

### Test 1: Ajout d'une SFD et vérification dans la liste

**Prérequis:**
- Avoir un compte Super Admin (email: superadmin@meref.ml, mot de passe: testadmin123)

**Étapes:**
1. Se connecter en tant que Super Admin depuis la page d'authentification (/auth?admin=true)
2. Naviguer vers l'onglet "SFDs" dans le tableau de bord Super Admin
3. Cliquer sur le bouton "Nouvelle SFD"
4. Remplir le formulaire avec les informations suivantes:
   - Nom: SFD Test Automation
   - Code: SFDTA
   - Région: Bamako
   - Statut: Actif
   - Solde de subvention initial: 1,000,000 FCFA
5. Soumettre le formulaire
6. Vérifier que la nouvelle SFD apparaît dans la liste
7. Vérifier les logs d'audit pour confirmer la création

**Résultat attendu:**
- La SFD est ajoutée à la liste avec le statut "Actif"
- Un message toast de confirmation apparaît
- Une entrée est ajoutée dans les logs d'audit

**Points de validation supplémentaires:**
- L'administrateur de la SFD est automatiquement créé avec les identifiants par défaut
- Le compte admin SFD peut se connecter avec l'email `admin-sfdta@ngnasoro.ml` (généré à partir du code)
- La SFD apparaît dans la liste des SFDs disponibles pour un nouvel utilisateur

## SFD Admin

### Test 1: Rejet d'une demande de prêt avec motif et vérification de l'email au client

**Prérequis:**
- Avoir un compte SFD Admin (email: sfdadmin@meref.ml, mot de passe: testadmin123)
- Avoir au moins une demande de prêt en attente dans le système

**Étapes:**
1. Se connecter en tant que SFD Admin depuis la page d'authentification (/auth?sfd=true)
2. Naviguer vers l'onglet "Demandes de prêt" dans le tableau de bord de l'agence
3. Identifier une demande de prêt avec le statut "En attente"
4. Ouvrir les détails de cette demande de prêt
5. Cliquer sur le bouton "Rejeter"
6. Dans la boîte de dialogue, entrer le motif du rejet: "Capacité de remboursement insuffisante"
7. Confirmer le rejet
8. Vérifier le statut mis à jour dans l'interface
9. Vérifier que le client a reçu une notification par email (vérifier dans les logs de la fonction Edge ou dans la boîte de réception de test)

**Résultat attendu:**
- Le statut du prêt passe à "Rejeté"
- Le motif du rejet est enregistré et visible dans les détails du prêt
- Un email est envoyé au client avec le motif du rejet
- Une activité de prêt est enregistrée dans l'historique avec le type "loan_rejected"

**Points de validation supplémentaires:**
- L'activité apparaît dans les logs d'audit de la SFD
- Le tableau de bord affiche correctement le nombre mis à jour de prêts rejetés

## Standard User

### Test 1: Soumission d'un prêt et vérification de la notification mobile

**Prérequis:**
- Avoir un compte utilisateur standard (email: user@meref.ml, mot de passe: testuser123)
- Avoir configuré au moins un compte SFD pour cet utilisateur

**Étapes:**
1. Se connecter en tant qu'utilisateur standard depuis la page d'authentification principale (/auth)
2. Naviguer vers la section "Demander un prêt" dans l'application mobile
3. Remplir le formulaire de demande de prêt avec:
   - Montant: 200,000 FCFA
   - Durée: 12 mois
   - Objet: "Financement de commerce"
   - Fournir les pièces justificatives requises (télécharger un exemple de document)
4. Soumettre la demande
5. Vérifier que la demande apparaît dans la section "Mes prêts" avec le statut "En attente"
6. Vérifier la réception d'une notification push sur l'appareil mobile
7. Ouvrir le centre de notifications de l'application

**Résultat attendu:**
- La demande de prêt est enregistrée avec le statut "En attente"
- Un message de confirmation apparaît à l'écran
- Une notification push est reçue sur l'appareil mobile
- La notification contient les détails de la demande de prêt
- La demande apparaît dans la liste des prêts en attente de l'utilisateur

**Points de validation supplémentaires:**
- La demande de prêt est visible dans le tableau de bord de l'administrateur SFD
- Les détails du prêt correspondent exactement aux informations saisies
- L'historique des transactions de l'utilisateur reflète cette activité
