-- Remove constraint que está impedindo inserção no tipo_cesta
ALTER TABLE public.acompanhamento_assistencial 
DROP CONSTRAINT IF EXISTS acompanhamento_assistencial_tipo_cesta_check;

-- Remove constraint de periodicidade também se existir
ALTER TABLE public.acompanhamento_assistencial 
DROP CONSTRAINT IF EXISTS acompanhamento_assistencial_periodicidade_check;

-- Permite valores nulos nos campos caso necessário
ALTER TABLE public.acompanhamento_assistencial 
ALTER COLUMN tipo_cesta DROP NOT NULL,
ALTER COLUMN periodicidade DROP NOT NULL;