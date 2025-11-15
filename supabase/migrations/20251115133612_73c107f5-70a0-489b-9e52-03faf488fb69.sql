-- ========================================
-- PHASE 1: Corriger les politiques RLS pour éviter la récursion infinie
-- ========================================

-- 1. Supprimer les politiques problématiques qui causent la récursion
DROP POLICY IF EXISTS "Users can view vaults they're members of" ON collaborative_vaults;
DROP POLICY IF EXISTS "Members can view their memberships" ON collaborative_vault_members;

-- 2. Créer une fonction SECURITY DEFINER pour vérifier l'appartenance au coffre
-- Cette fonction évite la récursion en s'exécutant avec des privilèges élevés
CREATE OR REPLACE FUNCTION is_vault_member(vault_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM collaborative_vault_members
    WHERE collaborative_vault_members.vault_id = $1
    AND collaborative_vault_members.user_id = $2
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Créer une nouvelle politique pour collaborative_vaults (sans récursion)
CREATE POLICY "Users can view vaults they create or are members of"
ON collaborative_vaults FOR SELECT
USING (
  creator_id = auth.uid() OR
  visibility = 'public' OR
  is_vault_member(id, auth.uid())
);

-- 4. Créer une nouvelle politique pour collaborative_vault_members (simplifiée)
CREATE POLICY "Members can view their own memberships"
ON collaborative_vault_members FOR SELECT
USING (
  user_id = auth.uid() OR
  is_vault_member(vault_id, auth.uid())
);

-- ========================================
-- PHASE 2: Ajouter le système de comptage des membres
-- ========================================

-- 1. Ajouter la colonne member_count
ALTER TABLE collaborative_vaults 
ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- 2. Créer une fonction pour mettre à jour automatiquement le compteur
CREATE OR REPLACE FUNCTION update_vault_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaborative_vaults
  SET member_count = (
    SELECT COUNT(*) 
    FROM collaborative_vault_members 
    WHERE vault_id = COALESCE(NEW.vault_id, OLD.vault_id)
    AND status = 'active'
  )
  WHERE id = COALESCE(NEW.vault_id, OLD.vault_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Créer le trigger sur les modifications de membres
DROP TRIGGER IF EXISTS trigger_update_vault_member_count ON collaborative_vault_members;
CREATE TRIGGER trigger_update_vault_member_count
AFTER INSERT OR UPDATE OR DELETE ON collaborative_vault_members
FOR EACH ROW EXECUTE FUNCTION update_vault_member_count();

-- 4. Initialiser les compteurs pour les coffres existants
UPDATE collaborative_vaults cv
SET member_count = (
  SELECT COUNT(*) 
  FROM collaborative_vault_members cvm 
  WHERE cvm.vault_id = cv.id 
  AND cvm.status = 'active'
);