-- Criar bucket para fotos dos assistidos
INSERT INTO storage.buckets (id, name, public) VALUES ('assistidos-fotos', 'assistidos-fotos', true);

-- Criar políticas de storage para fotos dos assistidos
CREATE POLICY "Usuários autenticados podem ver fotos dos assistidos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'assistidos-fotos');

CREATE POLICY "Usuários autenticados podem fazer upload de fotos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'assistidos-fotos');

CREATE POLICY "Usuários autenticados podem atualizar fotos dos assistidos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'assistidos-fotos');

CREATE POLICY "Usuários autenticados podem deletar fotos dos assistidos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'assistidos-fotos');