-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  tipo_usuario VARCHAR(50) DEFAULT 'operador' CHECK (tipo_usuario IN ('admin', 'operador', 'visitante')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de assistidos
CREATE TABLE public.assistidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  nome_completo VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  genero VARCHAR(20),
  estado_civil VARCHAR(30),
  rg VARCHAR(20),
  naturalidade VARCHAR(100),
  telefone VARCHAR(20),
  celular VARCHAR(20),
  foto_url TEXT,
  
  -- Endereço
  rua VARCHAR(255),
  numero VARCHAR(10),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  
  -- Situação
  situacao_moradia VARCHAR(20) CHECK (situacao_moradia IN ('Própria', 'Alugada')),
  encaminhado_por VARCHAR(50) CHECK (encaminhado_por IN ('Espontâneo', 'Oficina', 'Albergue', 'Outro')),
  status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Criar tabela de familiares
CREATE TABLE public.familiares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistido_id UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  parentesco VARCHAR(50),
  escolaridade VARCHAR(100),
  ocupacao VARCHAR(100),
  deficiencia BOOLEAN DEFAULT FALSE,
  tipo_deficiencia VARCHAR(255),
  necessita_fralda BOOLEAN DEFAULT FALSE,
  tamanho_fralda VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfil socioeconômico
CREATE TABLE public.perfil_socioeconomico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistido_id UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  situacao_profissional VARCHAR(30) CHECK (situacao_profissional IN ('Empregado', 'Desempregado', 'Informal')),
  renda_familiar DECIMAL(10,2),
  beneficios_recebidos TEXT[], -- Array de benefícios
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de acompanhamento assistencial
CREATE TABLE public.acompanhamento_assistencial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistido_id UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  analise_assistencial VARCHAR(20) CHECK (analise_assistencial IN ('Emergencial', 'Temporária', 'Permanente')),
  tipo_cesta VARCHAR(20) CHECK (tipo_cesta IN ('Pequena', 'Média', 'Grande')),
  inicio_recebimento DATE,
  periodicidade VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de retiradas de cesta
CREATE TABLE public.retiradas_cesta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistido_id UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  data_retirada DATE NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Criar tabela de visitas domiciliares
CREATE TABLE public.visitas_domiciliares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistido_id UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  data_visita DATE NOT NULL,
  nome_visitante VARCHAR(255) NOT NULL,
  recebido_por VARCHAR(255),
  relatorio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Criar tabela de documentos
CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistido_id UUID NOT NULL REFERENCES public.assistidos(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(50) NOT NULL,
  nome_arquivo VARCHAR(255) NOT NULL,
  url_arquivo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES public.profiles(id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_socioeconomico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamento_assistencial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retiradas_cesta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas_domiciliares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para profiles
CREATE POLICY "Usuários podem ver seus próprios perfis" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Permitir inserção de perfil na criação do usuário" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar políticas RLS para assistidos (todos usuários autenticados podem acessar)
CREATE POLICY "Usuários autenticados podem ver assistidos" ON public.assistidos
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir assistidos" ON public.assistidos
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar assistidos" ON public.assistidos
FOR UPDATE TO authenticated USING (true);

-- Criar políticas similares para outras tabelas
CREATE POLICY "Usuários autenticados podem acessar familiares" ON public.familiares
FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar perfil socioeconômico" ON public.perfil_socioeconomico
FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar acompanhamento" ON public.acompanhamento_assistencial
FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar retiradas" ON public.retiradas_cesta
FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar visitas" ON public.visitas_domiciliares
FOR ALL TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem acessar documentos" ON public.documentos
FOR ALL TO authenticated USING (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assistidos_updated_at
  BEFORE UPDATE ON public.assistidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_perfil_socioeconomico_updated_at
  BEFORE UPDATE ON public.perfil_socioeconomico
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acompanhamento_updated_at
  BEFORE UPDATE ON public.acompanhamento_assistencial
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar índices para melhor performance
CREATE INDEX idx_assistidos_cpf ON public.assistidos(cpf);
CREATE INDEX idx_assistidos_nome ON public.assistidos(nome_completo);
CREATE INDEX idx_familiares_assistido ON public.familiares(assistido_id);
CREATE INDEX idx_retiradas_data ON public.retiradas_cesta(data_retirada);
CREATE INDEX idx_visitas_data ON public.visitas_domiciliares(data_visita);