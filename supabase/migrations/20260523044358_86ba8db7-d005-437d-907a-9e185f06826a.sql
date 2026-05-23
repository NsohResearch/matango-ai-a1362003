
ALTER TABLE public.operator_knowledge_docs
  ADD COLUMN IF NOT EXISTS doc_type text NOT NULL DEFAULT 'document',
  ADD COLUMN IF NOT EXISTS question text,
  ADD COLUMN IF NOT EXISTS answer text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS file_name text,
  ADD COLUMN IF NOT EXISTS file_size bigint,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS priority int NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_okd_doc_type ON public.operator_knowledge_docs(deployment_id, doc_type);
CREATE INDEX IF NOT EXISTS idx_okd_status ON public.operator_knowledge_docs(deployment_id, status);

INSERT INTO storage.buckets (id, name, public)
VALUES ('operator-knowledge', 'operator-knowledge', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users read own operator knowledge files" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own operator knowledge files" ON storage.objects;
DROP POLICY IF EXISTS "Users update own operator knowledge files" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own operator knowledge files" ON storage.objects;

CREATE POLICY "Users read own operator knowledge files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'operator-knowledge' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own operator knowledge files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'operator-knowledge' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own operator knowledge files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'operator-knowledge' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own operator knowledge files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'operator-knowledge' AND auth.uid()::text = (storage.foldername(name))[1]);
