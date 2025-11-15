-- Table pour l'historique des approbations SFD
CREATE TABLE IF NOT EXISTS public.sfd_approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sfd_id UUID NOT NULL REFERENCES public.sfds(id) ON DELETE CASCADE,
  reviewed_by UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  comments TEXT,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sfd_approval_history_sfd_id ON public.sfd_approval_history(sfd_id);
CREATE INDEX IF NOT EXISTS idx_sfd_approval_history_reviewed_at ON public.sfd_approval_history(reviewed_at DESC);

-- Enable RLS
ALTER TABLE public.sfd_approval_history ENABLE ROW LEVEL SECURITY;

-- Policy: Seuls les admins MEREF peuvent voir l'historique
CREATE POLICY "Admins can view approval history"
ON public.sfd_approval_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Seuls les admins MEREF peuvent créer des entrées d'historique
CREATE POLICY "Admins can create approval history"
ON public.sfd_approval_history
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Ajouter des colonnes manquantes dans sfds pour le workflow d'approbation
ALTER TABLE public.sfds 
ADD COLUMN IF NOT EXISTS approval_notes TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID;