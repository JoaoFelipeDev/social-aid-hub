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
import { MapPin, Calendar, User, FileText, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VisitaDomiciliar {
  id: string;
  assistido_id: string;
  data_visita: string;
  nome_visitante: string;
  recebido_por?: string;
  relatorio?: string;
  created_at: string;
  assistidos?: {
    nome_completo: string;
    endereco_completo?: string;
  };
}

interface Assistido {
  id: string;
  nome_completo: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
}

export default function Visitas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssistido, setSelectedAssistido] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    assistido_id: "",
    data_visita: "",
    nome_visitante: "",
    recebido_por: "",
    relatorio: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar visitas
  const { data: visitas = [], isLoading } = useQuery({
    queryKey: ["visitas-domiciliares", selectedAssistido],
    queryFn: async () => {
      let query = supabase
        .from("visitas_domiciliares")
        .select(`
          *,
          assistidos:assistido_id (
            nome_completo,
            rua,
            numero,
            bairro,
            cidade
          )
        `)
        .order("data_visita", { ascending: false });

      if (selectedAssistido && selectedAssistido !== "all") {
        query = query.eq("assistido_id", selectedAssistido);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VisitaDomiciliar[];
    }
  });

  // Buscar assistidos para o select
  const { data: assistidos = [] } = useQuery({
    queryKey: ["assistidos-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistidos")
        .select("id, nome_completo, rua, numero, bairro, cidade")
        .eq("status", "Ativo")
        .order("nome_completo");
      
      if (error) throw error;
      return data as Assistido[];
    }
  });

  // Mutation para criar visita
  const createVisitaMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("visitas_domiciliares")
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitas-domiciliares"] });
      setIsDialogOpen(false);
      setFormData({
        assistido_id: "",
        data_visita: "",
        nome_visitante: "",
        recebido_por: "",
        relatorio: ""
      });
      toast({
        title: "Visita registrada!",
        description: "A visita domiciliar foi registrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar visita",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assistido_id || !formData.data_visita || !formData.nome_visitante) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    createVisitaMutation.mutate(formData);
  };

  const visitasFiltradas = visitas.filter(visita =>
    visita.assistidos?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visita.nome_visitante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarEndereco = (assistido: any) => {
    const partes = [assistido.rua, assistido.numero, assistido.bairro, assistido.cidade].filter(Boolean);
    return partes.join(", ");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Visitas Domiciliares</h1>
            <p className="text-muted-foreground">Registre e acompanhe as visitas domiciliares realizadas</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Visita
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Visita Domiciliar</DialogTitle>
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
                        {assistidos.map((assistido) => (
                          <SelectItem key={assistido.id} value={assistido.id}>
                            {assistido.nome_completo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_visita">Data da Visita *</Label>
                    <Input
                      id="data_visita"
                      type="date"
                      value={formData.data_visita}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_visita: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome_visitante">Nome do Visitante *</Label>
                    <Input
                      id="nome_visitante"
                      value={formData.nome_visitante}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome_visitante: e.target.value }))}
                      placeholder="Nome completo do visitante"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recebido_por">Recebido Por</Label>
                    <Input
                      id="recebido_por"
                      value={formData.recebido_por}
                      onChange={(e) => setFormData(prev => ({ ...prev, recebido_por: e.target.value }))}
                      placeholder="Quem recebeu a visita"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relatorio">Relatório da Visita</Label>
                  <Textarea
                    id="relatorio"
                    value={formData.relatorio}
                    onChange={(e) => setFormData(prev => ({ ...prev, relatorio: e.target.value }))}
                    placeholder="Descreva como foi a visita, observações importantes..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createVisitaMutation.isPending}>
                    {createVisitaMutation.isPending ? "Salvando..." : "Salvar Visita"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por assistido ou visitante..."
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

        {/* Lista de Visitas */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando visitas...</p>
          </div>
        ) : visitasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma visita encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || (selectedAssistido && selectedAssistido !== "all") 
                  ? "Nenhuma visita corresponde aos filtros aplicados."
                  : "Comece registrando a primeira visita domiciliar."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {visitasFiltradas.map((visita) => (
              <Card key={visita.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {visita.assistidos?.nome_completo}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatarEndereco(visita.assistidos)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(visita.data_visita), "dd/MM/yyyy", { locale: ptBR })}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Visitante:</strong> {visita.nome_visitante}
                      </span>
                    </div>
                    {visita.recebido_por && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          <strong>Recebido por:</strong> {visita.recebido_por}
                        </span>
                      </div>
                    )}
                  </div>

                  {visita.relatorio && (
                    <div className="border-t pt-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium mb-1">Relatório:</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {visita.relatorio}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}