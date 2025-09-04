-- Criar bucket de storage para documentos
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true);

-- Criar políticas de acesso para o bucket de documentos
CREATE POLICY "Todos podem ver documentos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documentos');

CREATE POLICY "Usuários autenticados podem fazer upload de documentos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Usuários autenticados podem atualizar documentos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'documentos');

CREATE POLICY "Usuários autenticados podem excluir documentos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documentos');