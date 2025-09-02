-- Add unique constraint on assistido_id to enable UPSERT operations
ALTER TABLE public.perfil_socioeconomico 
ADD CONSTRAINT perfil_socioeconomico_assistido_id_unique UNIQUE (assistido_id);