import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Edit, FileText, Heart, UserPlus, Filter } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface AssistidoData {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string | null;
  telefone: string | null;
  celular: string | null;
  status: string | null;
  created_at: string;
  // Campos para verificar completude
  rua: string | null;
  cidade: string | null;
  situacao_moradia: string | null;
  // Tabelas relacionadas
  familiares_count?: number;
  perfil_socioeconomico_exists?: boolean;
}

type StatusFilter = "todos" | "ativo" | "inativo";
type CompletudeFilter = "todos" | "completo" | "parcial";

export default function Assistidos() {
  const navigate = useNavigate();
  const [assistidos, setAssistidos] = useState<AssistidoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [completudeFilter, setCompletudeFilter] = useState<CompletudeFilter>("todos");

  useEffect(() => {
    fetchAssistidos();
  }, []);

  const fetchAssistidos = async () => {
    try {
      setLoading(true);
      
      // Buscar assistidos com contagem de familiares e verificação de perfil socioeconômico
      const { data: assistidosData, error } = await supabase
        .from('assistidos')
        .select(`
          id,
          nome_completo,
          cpf,
          data_nascimento,
          telefone,
          celular,
          status,
          created_at,
          rua,
          cidade,
          situacao_moradia,
          familiares(count),
          perfil_socioeconomico(id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Processar dados para incluir contadores
      const processedData = assistidosData?.map(assistido => ({
        ...assistido,
        familiares_count: assistido.familiares?.length || 0,
        perfil_socioeconomico_exists: (assistido.perfil_socioeconomico?.length || 0) > 0
      })) || [];

      setAssistidos(processedData);
    } catch (error) {
      console.error('Erro ao carregar assistidos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de assistidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para determinar status de completude do cadastro
  const getCompletudeStatus = (assistido: AssistidoData) => {
    const hasBasicData = assistido.nome_completo && assistido.cpf;
    const hasAddress = assistido.rua && assistido.cidade && assistido.situacao_moradia;
    const hasFamiliares = (assistido.familiares_count || 0) > 0;
    const hasPerfil = assistido.perfil_socioeconomico_exists;

    if (hasBasicData && hasAddress && hasPerfil) {
      return "completo";
    } else if (hasBasicData) {
      return "parcial";
    } else {
      return "incompleto";
    }
  };

  // Filtrar assistidos
  const filteredAssistidos = assistidos.filter(assistido => {
    // Filtro de busca
    const matchesSearch = 
      assistido.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistido.cpf.includes(searchTerm.replace(/[^\d]/g, ''));

    // Filtro de status
    const matchesStatus = statusFilter === "todos" || 
      (statusFilter === "ativo" && assistido.status === "Ativo") ||
      (statusFilter === "inativo" && assistido.status === "Inativo");

    // Filtro de completude
    const completude = getCompletudeStatus(assistido);
    const matchesCompletude = completudeFilter === "todos" || 
      (completudeFilter === "completo" && completude === "completo") ||
      (completudeFilter === "parcial" && (completude === "parcial" || completude === "incompleto"));

    return matchesSearch && matchesStatus && matchesCompletude;
  });

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string | null) => {
    if (status === "Ativo") {
      return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  const getCompletudeBadge = (assistido: AssistidoData) => {
    const status = getCompletudeStatus(assistido);
    
    switch (status) {
      case "completo":
        return <Badge className="bg-green-100 text-green-800">Completo</Badge>;
      case "parcial":
        return <Badge className="bg-yellow-100 text-yellow-800">Parcial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Incompleto</Badge>;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assistidos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os assistidos cadastrados no sistema
            </p>
          </div>
          <Button onClick={() => navigate("/cadastro")} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Assistido
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Busca
            </CardTitle>
            <CardDescription>
              Use os filtros abaixo para encontrar assistidos específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Completude</label>
                <Select value={completudeFilter} onValueChange={(value: CompletudeFilter) => setCompletudeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="completo">Completo</SelectItem>
                    <SelectItem value="parcial">Parcial/Incompleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Assistidos ({filteredAssistidos.length})
            </CardTitle>
            <CardDescription>
              {loading ? "Carregando..." : `${filteredAssistidos.length} assistidos encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando assistidos...</p>
              </div>
            ) : filteredAssistidos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum assistido encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completude</TableHead>
                      <TableHead>Cadastrado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssistidos.map((assistido) => (
                      <TableRow key={assistido.id}>
                        <TableCell className="font-medium">
                          {assistido.nome_completo}
                        </TableCell>
                        <TableCell>
                          {formatCPF(assistido.cpf)}
                        </TableCell>
                        <TableCell>
                          {assistido.celular || assistido.telefone || "-"}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(assistido.status)}
                        </TableCell>
                        <TableCell>
                          {getCompletudeBadge(assistido)}
                        </TableCell>
                        <TableCell>
                          {formatDate(assistido.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/assistidos/${assistido.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/editar-assistido/${assistido.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // TODO: Implementar acompanhamento
                                toast({
                                  title: "Em desenvolvimento",
                                  description: "Funcionalidade de acompanhamento será implementada em breve.",
                                });
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}