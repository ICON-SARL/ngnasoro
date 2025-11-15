-- Phase 1: Créer bucket de stockage et politiques RLS
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false);

-- Politique: Clients peuvent uploader leurs documents
CREATE POLICY "Clients can upload their documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents' 
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM sfd_clients WHERE user_id = auth.uid()
  )
);

-- Politique: Clients peuvent lire leurs documents
CREATE POLICY "Clients can view their documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM sfd_clients WHERE user_id = auth.uid()
  )
);

-- Politique: SFD Admins peuvent lire documents de leurs clients
CREATE POLICY "SFD admins can view client documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND has_role(auth.uid(), 'sfd_admin')
  AND (storage.foldername(name))[1] IN (
    SELECT sc.id::text 
    FROM sfd_clients sc
    JOIN user_sfds us ON us.sfd_id = sc.sfd_id
    WHERE us.user_id = auth.uid()
  )
);

-- Activer Realtime sur client_documents pour notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_documents;