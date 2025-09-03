-- Remove constraint que impede valores vazios na análise assistencial
ALTER TABLE public.acompanhamento_assistencial 
DROP CONSTRAINT IF EXISTS acompanhamento_assistencial_analise_assistencial_check;

-- Permite valores nulos e vazios na análise assistencial
ALTER TABLE public.acompanhamento_assistencial 
ALTER COLUMN analise_assistencial DROP NOT NULL;