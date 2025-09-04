import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Calendar, User, ClipboardList, Plus, Search, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RetiradaCesta {
  id: string;
  assistido_id: string;
  data_retirada: string;
  observacao?: string;
  created_at: string;
  assistidos?: {
    nome_completo: string;
  };
}

interface Assistido {
  id: string;
  nome_completo: string;
}

interface AcompanhamentoAssistencial {
  periodicidade?: string;
  tipo_cesta?: string;
  inicio_recebimento?: string;
}

export default function Cestas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssistido, setSelectedAssistido] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    assistido_id: "",
    data_retirada: "",
    observacao: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar retiradas de cestas
  const { data: retiradas = [], isLoading } = useQuery({
    queryKey: ["retiradas-cesta", selectedAssistido],
    queryFn: async () => {
      let query = supabase
        .from("retiradas_cesta")
        .select(`
          *,
          assistidos:assistido_id (
            nome_completo
          )
        `)
        .order("data_retirada", { ascending: false });

      if (selectedAssistido && selectedAssistido !== "all") {
        query = query.eq("assistido_id", selectedAssistido);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RetiradaCesta[];
    }
  });

  // Buscar assistidos para o select
  const { data: assistidos = [] } = useQuery({
    queryKey: ["assistidos-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistidos")
        .select("id, nome_completo")
        .eq("status", "Ativo")
        .order("nome_completo");
      
      if (error) throw error;
      return data as Assistido[];
    }
  });

  // Buscar acompanhamento assistencial para controle de periodicidade
  const { data: acompanhamentos = [] } = useQuery({
    queryKey: ["acompanhamentos-periodicidade"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acompanhamento_assistencial")
        .select("assistido_id, periodicidade, tipo_cesta, inicio_recebimento");
      
      if (error) throw error;
      return data;
    }
  });

  // Mutation para registrar retirada
  const criarRetiradaMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("retiradas_cesta")
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retiradas-cesta"] });
      setIsDialogOpen(false);
      setFormData({
        assistido_id: "",
        data_retirada: "",
        observacao: ""
      });
      toast({
        title: "Retirada registrada!",
        description: "A retirada da cesta foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar retirada",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assistido_id || !formData.data_retirada) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    criarRetiradaMutation.mutate(formData);
  };

  const retiradasFiltradas = retiradas.filter(retirada =>
    retirada.assistidos?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para verificar se assistido pode retirar cesta baseado na periodicidade
  const podeRetirarCesta = (assistidoId: string) => {
    const acompanhamento = acompanhamentos.find(a => a.assistido_id === assistidoId);
    if (!acompanhamento?.periodicidade) return { pode: true, motivo: "" };

    const ultimaRetirada = retiradas
      .filter(r => r.assistido_id === assistidoId)
      .sort((a, b) => new Date(b.data_retirada).getTime() - new Date(a.data_retirada).getTime())[0];

    if (!ultimaRetirada) return { pode: true, motivo: "" };

    const diasDesdeUltimaRetirada = differenceInDays(new Date(), new Date(ultimaRetirada.data_retirada));
    
    let intervaloDias = 0;
    switch (acompanhamento.periodicidade.toLowerCase()) {
      case "semanal":
        intervaloDias = 7;
        break;
      case "quinzenal":
        intervaloDias = 15;
        break;
      case "mensal":
        intervaloDias = 30;
        break;
      case "bimestral":
        intervaloDias = 60;
        break;
      default:
        return { pode: true, motivo: "" };
    }

    if (diasDesdeUltimaRetirada < intervaloDias) {
      const proximaData = addMonths(new Date(ultimaRetirada.data_retirada), 1);
      return {
        pode: false,
        motivo: `Próxima retirada permitida em ${format(proximaData, "dd/MM/yyyy", { locale: ptBR })}`
      };
    }

    return { pode: true, motivo: "" };
  };

  // Estatísticas
  const estatisticas = {
    totalRetiradas: retiradas.length,
    retiradosHoje: retiradas.filter(r => 
      format(new Date(r.data_retirada), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    ).length,
    assistidosUnicos: new Set(retiradas.map(r => r.assistido_id)).size
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Montagem de Cestas</h1>
            <p className="text-muted-foreground">Controle e registro de retiradas de cestas básicas</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Retirada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Retirada de Cesta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assistido_id">Assistido *</Label>
                    <Select 
                      value={formData.assistido_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, assistido_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o assistido" />
                      </SelectTrigger>
                      <SelectContent>
                        {assistidos.map((assistido) => {
                          const statusRetirada = podeRetirarCesta(assistido.id);
                          return (
                            <SelectItem 
                              key={assistido.id} 
                              value={assistido.id}
                              disabled={!statusRetirada.pode}
                            >
                              <div className="flex items-center gap-2">
                                {assistido.nome_completo}
                                {!statusRetirada.pode && (
                                  <Badge variant="destructive" className="text-xs">
                                    Aguardar
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {formData.assistido_id && !podeRetirarCesta(formData.assistido_id).pode && (
                      <p className="text-sm text-destructive">
                        {podeRetirarCesta(formData.assistido_id).motivo}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_retirada">Data da Retirada *</Label>
                    <Input
                      id="data_retirada"
                      type="date"
                      value={formData.data_retirada}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_retirada: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacao">Observações</Label>
                  <Textarea
                    id="observacao"
                    value={formData.observacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacao: e.target.value }))}
                    placeholder="Observações sobre a retirada, itens especiais incluídos..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={criarRetiradaMutation.isPending}>
                    {criarRetiradaMutation.isPending ? "Salvando..." : "Registrar Retirada"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.totalRetiradas}</p>
                  <p className="text-sm text-muted-foreground">Total de Retiradas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.retiradosHoje}</p>
                  <p className="text-sm text-muted-foreground">Retiradas Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.assistidosUnicos}</p>
                  <p className="text-sm text-muted-foreground">Assistidos Únicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome do assistido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedAssistido} onValueChange={setSelectedAssistido}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Filtrar por assistido" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os assistidos</SelectItem>
              {assistidos.map((assistido) => (
                <SelectItem key={assistido.id} value={assistido.id}>
                  {assistido.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Retiradas */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando retiradas...</p>
          </div>
        ) : retiradasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma retirada encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || (selectedAssistido !== "all")
                  ? "Nenhuma retirada corresponde aos filtros aplicados."
                  : "Comece registrando a primeira retirada de cesta."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {retiradasFiltradas.map((retirada) => {
              const acompanhamento = acompanhamentos.find(a => a.assistido_id === retirada.assistido_id);
              const statusProximaRetirada = podeRetirarCesta(retirada.assistido_id);
              
              return (
                <Card key={retirada.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {retirada.assistidos?.nome_completo}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(retirada.data_retirada), "dd/MM/yyyy", { locale: ptBR })}
                          </Badge>
                          {acompanhamento?.tipo_cesta && (
                            <Badge variant="secondary">
                              {acompanhamento.tipo_cesta}
                            </Badge>
                          )}
                          {acompanhamento?.periodicidade && (
                            <Badge variant="outline">
                              {acompanhamento.periodicidade}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!statusProximaRetirada.pode && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs">Aguardar próxima</span>
                        </div>
                      )}
                    </div>

                    {retirada.observacao && (
                      <div className="border-t pt-4">
                        <div className="flex items-start gap-2">
                          <ClipboardList className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium mb-1">Observações:</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {retirada.observacao}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!statusProximaRetirada.pode && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-xs text-muted-foreground">
                          {statusProximaRetirada.motivo}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}