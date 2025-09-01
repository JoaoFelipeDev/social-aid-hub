-- Ajustar política RLS da tabela familiares para permitir acesso sem autenticação
-- Remove a política atual
DROP POLICY IF EXISTS "Usuários autenticados podem acessar familiares" ON public.familiares;

-- Cria novas políticas que permitem acesso público (como nas outras tabelas)
CREATE POLICY "Enable read access for all users" ON public.familiares FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.familiares FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.familiares FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.familiares FOR DELETE USING (true);