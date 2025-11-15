-- Ajouter colonnes pour tracer l'acceptation des CGU dans profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS terms_version VARCHAR(10) DEFAULT '1.0';

-- Index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_terms_accepted ON public.profiles(terms_accepted_at);

-- Corriger les fonctions avec search_path pour la sécurité
-- (déjà fait dans migration précédente mais on s'assure)

COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'Date et heure d''acceptation des CGU par l''utilisateur';
COMMENT ON COLUMN public.profiles.terms_version IS 'Version des CGU acceptées par l''utilisateur';