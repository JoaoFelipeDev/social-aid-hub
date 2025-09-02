import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Phone, MapPin, Users, DollarSign, FileText, Calendar, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AssistidoCompleto {
  id: string;
  nome_completo: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string | null;
  genero: string | null;
  estado_civil: string | null;
  naturalidade: string | null;
  telefone: string | null;
  celular: string | null;
  status: string | null;
  encaminhado_por: string | null;
  foto_url: string | null;
  // Endereço
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  situacao_moradia: string | null;
  created_at: string;
  // Relacionamentos
  familiares: any[];
  perfil_socioeconomico: any | null;
  acompanhamento_assistencial: any[];
  retiradas_cesta: any[];
  visitas_domiciliares: any[];
  documentos: any[];
}

export default function VisualizarAssistido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assistido, setAssistido] = useState<AssistidoCompleto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAssistido(id);
    }
  }, [id]);

  const fetchAssistido = async (assistidoId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assistidos')
        .select(`
          *,
          familiares(*),
          perfil_socioeconomico(*),
          acompanhamento_assistencial(*),
          retiradas_cesta(*),
          visitas_domiciliares(*),
          documentos(*)
        `)
        .eq('id', assistidoId)
        .single();

      if (error) {
        throw error;
      }

      setAssistido(data);
    } catch (error) {
      console.error('Erro ao carregar assistido:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do assistido",
        variant: "destructive",
      });
      navigate('/assistidos');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusBadge = (status: string | null) => {
    if (status === "Ativo") {
      return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!assistido) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Assistido não encontrado.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/assistidos')}>
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{assistido.nome_completo}</h1>
              <p className="text-muted-foreground">
                Visualização completa dos dados do assistido
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/assistidos/${id}/editar`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline">
              <Heart className="w-4 h-4 mr-2" />
              Acompanhar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                    <p className="font-medium">{assistido.nome_completo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CPF</label>
                    <p className="font-medium">{formatCPF(assistido.cpf)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">RG</label>
                    <p className="font-medium">{assistido.rg || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                    <p className="font-medium">
                      {assistido.data_nascimento 
                        ? `${formatDate(assistido.data_nascimento)} (${calculateAge(assistido.data_nascimento)} anos)`
                        : "Não informado"
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                    <p className="font-medium">{assistido.genero || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado Civil</label>
                    <p className="font-medium">{assistido.estado_civil || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Naturalidade</label>
                    <p className="font-medium">{assistido.naturalidade || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div>{getStatusBadge(assistido.status)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="font-medium">
                      {assistido.telefone ? formatPhone(assistido.telefone) : "Não informado"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Celular</label>
                    <p className="font-medium">
                      {assistido.celular ? formatPhone(assistido.celular) : "Não informado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Rua</label>
                    <p className="font-medium">{assistido.rua || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Número</label>
                    <p className="font-medium">{assistido.numero || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                    <p className="font-medium">{assistido.bairro || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                    <p className="font-medium">{assistido.cidade || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estado</label>
                    <p className="font-medium">{assistido.estado || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CEP</label>
                    <p className="font-medium">{assistido.cep || "Não informado"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Situação da Moradia</label>
                    <p className="font-medium">{assistido.situacao_moradia || "Não informado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Familiares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Familiares ({assistido.familiares?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assistido.familiares?.length > 0 ? (
                  <div className="space-y-4">
                    {assistido.familiares.map((familiar, index) => (
                      <div key={familiar.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Nome</label>
                            <p className="font-medium">{familiar.nome}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Parentesco</label>
                            <p>{familiar.parentesco || "Não informado"}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Idade</label>
                            <p>
                              {familiar.data_nascimento 
                                ? `${calculateAge(familiar.data_nascimento)} anos`
                                : "Não informado"
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum familiar cadastrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar direita */}
          <div className="space-y-6">
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cadastrado em</label>
                  <p className="font-medium">{formatDate(assistido.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Encaminhado por</label>
                  <p className="font-medium">{assistido.encaminhado_por || "Não informado"}</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Familiares:</span>
                    <span className="font-medium">{assistido.familiares?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Documentos:</span>
                    <span className="font-medium">{assistido.documentos?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Visitas:</span>
                    <span className="font-medium">{assistido.visitas_domiciliares?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retiradas:</span>
                    <span className="font-medium">{assistido.retiradas_cesta?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Perfil Socioeconômico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Perfil Socioeconômico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assistido.perfil_socioeconomico ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Renda Familiar</label>
                      <p className="font-medium">
                        {assistido.perfil_socioeconomico.renda_familiar 
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(assistido.perfil_socioeconomico.renda_familiar)
                          : "Não informado"
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Situação Profissional</label>
                      <p className="font-medium">
                        {assistido.perfil_socioeconomico.situacao_profissional || "Não informado"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Não cadastrado</p>
                )}
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Documentos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Visita
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  Nova Retirada
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}