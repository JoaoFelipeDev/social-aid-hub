-- Remove políticas RLS restritivas existentes para perfil_socioeconomico
DROP POLICY IF EXISTS "Usuários autenticados podem acessar perfil socioeconômico" ON public.perfil_socioeconomico;

-- Criar políticas RLS simples que permitem operações para todos os usuários
CREATE POLICY "Permitir acesso total para todos os usuários - perfil_socioeconomico" 
ON public.perfil_socioeconomico 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);