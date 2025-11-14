# Workflows Automatiques - Phase 4

## Vue d'ensemble

La Phase 4 implémente des workflows automatiques pour automatiser les tâches répétitives et améliorer l'efficacité opérationnelle du système MEREF-SFD.

## Fonctionnalités implémentées

### 1. Mise à jour automatique des statistiques SFD

**Trigger :** `update_sfd_stats()`

Mise à jour automatique des statistiques après chaque modification de :
- Clients (ajout, modification, suppression)
- Prêts (création, changement de statut)
- Paiements (enregistrement)

**Statistiques calculées :**
- Total clients
- Total prêts
- Prêts actifs
- Prêts en défaut
- Total décaissé
- Total remboursé

### 2. Alertes de subventions automatiques

**Trigger :** `check_subsidy_threshold()`

Génère automatiquement des alertes quand le solde de subvention d'un SFD atteint :
- Seuil bas (par défaut: 1 000 000 FCFA) → Alerte Warning
- Seuil critique (par défaut: 500 000 FCFA) → Alerte Critical

**Actions automatiques :**
- Création de notifications pour les admins MEREF
- Enregistrement dans les logs d'audit
- Affichage dans le dashboard SFD

### 3. Génération d'échéancier de prêt

**Fonction :** `generate_loan_schedule()`

Génère automatiquement un échéancier de remboursement complet pour un prêt avec :
- Numéro de paiement
- Date de paiement
- Montant principal
- Montant intérêts
- Paiement total
- Solde restant

**Utilisation :**
```sql
SELECT * FROM generate_loan_schedule(
  'loan_id_uuid',
  1000000,  -- montant
  0.15,     -- taux d'intérêt (15%)
  12,       -- durée en mois
  CURRENT_DATE  -- date de début
);
```

### 4. Calcul automatique des pénalités de retard

**Fonction :** `calculate_loan_penalties()`

Exécutée quotidiennement pour :
- Identifier les prêts en retard
- Calculer les pénalités (5% du paiement mensuel par mois de retard)
- Enregistrer les pénalités dans `loan_penalties`
- Mettre à jour le montant restant du prêt
- Marquer automatiquement comme "defaulted" après 90 jours de retard
- Notifier l'admin SFD

**Formule de pénalité :**
```
pénalité = (paiement_mensuel × 5%) × (jours_retard / 30)
```

### 5. Mise à jour automatique de la date de prochain paiement

**Trigger :** `update_next_payment_date()`

Après chaque paiement réussi :
- Avance automatiquement la date du prochain paiement d'1 mois
- Maintient le statut du prêt à jour

### 6. Réconciliation automatique Mobile Money

**Fonction :** `auto_reconcile_mobile_money()`

Réconcilie automatiquement les paiements Mobile Money en :
- Recherchant les transactions correspondantes (référence + montant)
- Mettant à jour le statut des transactions
- Marquant les réconciliations comme complétées
- Enregistrant dans les logs d'audit

**Retour :**
```json
{
  "reconciled_count": 5,
  "total_amount": 250000
}
```

## Configuration des tâches planifiées

### Prérequis

Activer les extensions PostgreSQL :
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Configuration des cron jobs

#### 1. Calcul quotidien des pénalités (1h du matin)

```sql
SELECT cron.schedule(
  'calculate-daily-penalties',
  '0 1 * * *',  -- Tous les jours à 1h00
  $$
  SELECT net.http_post(
    url:='https://hnzozzbnfougbcncdgrk.supabase.co/functions/v1/scheduled-tasks',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{"task": "calculate_penalties"}'::jsonb
  ) as request_id;
  $$
);
```

#### 2. Réconciliation Mobile Money (toutes les 15 minutes)

```sql
SELECT cron.schedule(
  'auto-reconcile-mm',
  '*/15 * * * *',  -- Toutes les 15 minutes
  $$
  SELECT net.http_post(
    url:='https://hnzozzbnfougbcncdgrk.supabase.co/functions/v1/scheduled-tasks',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{"task": "auto_reconcile"}'::jsonb
  ) as request_id;
  $$
);
```

#### 3. Mise à jour des stats (toutes les heures)

```sql
SELECT cron.schedule(
  'update-stats-hourly',
  '0 * * * *',  -- Toutes les heures
  $$
  SELECT net.http_post(
    url:='https://hnzozzbnfougbcncdgrk.supabase.co/functions/v1/scheduled-tasks',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body:='{"task": "update_all_stats"}'::jsonb
  ) as request_id;
  $$
);
```

### Gestion des cron jobs

**Lister les jobs :**
```sql
SELECT * FROM cron.job;
```

**Supprimer un job :**
```sql
SELECT cron.unschedule('job_name');
```

**Voir l'historique d'exécution :**
```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

## Edge Function: scheduled-tasks

### Endpoint
`POST /functions/v1/scheduled-tasks`

### Paramètres
```json
{
  "task": "calculate_penalties" | "auto_reconcile" | "update_all_stats"
}
```

### Tâches disponibles

#### calculate_penalties
Calcule les pénalités pour tous les prêts en retard

**Réponse :**
```json
{
  "success": true,
  "task": "calculate_penalties",
  "message": "Pénalités calculées avec succès"
}
```

#### auto_reconcile
Réconcilie automatiquement les paiements Mobile Money

**Réponse :**
```json
{
  "success": true,
  "task": "auto_reconcile",
  "reconciled_count": 5,
  "total_amount": 250000,
  "message": "5 transactions réconciliées"
}
```

#### update_all_stats
Force la mise à jour de toutes les statistiques SFD

**Réponse :**
```json
{
  "success": true,
  "task": "update_all_stats",
  "sfds_updated": 12,
  "message": "Stats mises à jour pour 12 SFDs"
}
```

## Composants d'alertes frontend

### SubsidyAlerts
Affiche les alertes de subvention pour le SFD actif
- Rafraîchissement automatique toutes les minutes
- Affiche le solde actuel et le seuil

**Utilisation :**
```tsx
import { SubsidyAlerts } from '@/components/alerts';

<SubsidyAlerts />
```

### LoanDefaultAlerts
Affiche les prêts en retard de paiement
- Rafraîchissement toutes les 5 minutes
- Liste les 5 prêts les plus en retard
- Lien vers la liste complète

**Utilisation :**
```tsx
import { LoanDefaultAlerts } from '@/components/alerts';

<LoanDefaultAlerts />
```

## Index et optimisations

Les index suivants ont été créés pour optimiser les performances :

- `idx_sfd_loans_status_date` : Prêts actifs avec date de paiement
- `idx_loan_payments_loan_status` : Paiements par prêt et statut
- `idx_transactions_reference` : Recherche par référence transaction
- `idx_mobile_money_reconciliations_status` : Réconciliations en attente

## Logs et monitoring

Toutes les opérations automatiques sont enregistrées dans :
- **audit_logs** : Trace complète des actions système
- **admin_notifications** : Notifications pour les utilisateurs

**Requête de monitoring :**
```sql
SELECT 
  action,
  category,
  severity,
  status,
  details,
  created_at
FROM audit_logs
WHERE category IN ('system', 'payment', 'subsidy')
ORDER BY created_at DESC
LIMIT 50;
```

## Prochaines étapes recommandées

1. **Activer pg_cron** dans votre projet Supabase
2. **Configurer les cron jobs** avec vos URLs et clés API
3. **Tester manuellement** chaque edge function
4. **Monitorer les logs** pendant 24-48h
5. **Ajuster les seuils** selon vos besoins métier

## Support

Pour toute question ou problème :
- Vérifier les logs d'audit : `SELECT * FROM audit_logs WHERE status = 'error'`
- Consulter l'historique cron : `SELECT * FROM cron.job_run_details`
- Tester manuellement les fonctions via l'interface Supabase
