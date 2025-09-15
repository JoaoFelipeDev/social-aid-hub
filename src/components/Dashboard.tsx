import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users, Calendar, TrendingUp } from "lucide-react";

import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Assistido {
  id: string;
  nome_completo: string;
  cpf: string;
  status: string | null;
}

interface Cesta {
  id: string;
  data_retirada: string;
}

interface Visita {
  id: string;
  data_visita: string;
}

export function Dashboard() {
  const [assistidos, setAssistidos] = useState<Assistido[]>([]);
  const [cestas, setCestas] = useState<Cesta[]>([]);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
  fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    // Assistidos
    const { data: assistidosData, error: assistidosError } = await supabase
      .from("assistidos")
      .select("id, nome_completo, cpf, status")
      .order("created_at", { ascending: false });
    if (!assistidosError && assistidosData) {
      setAssistidos(assistidosData);
    }

    // Cestas entregues no mês atual
    const now = new Date();
    const primeiroDia = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const { data: cestasData, error: cestasError } = await supabase
      .from("retiradas_cesta")
      .select("id, data_retirada")
      .gte("data_retirada", primeiroDia)
      .lte("data_retirada", ultimoDia);
    if (!cestasError && cestasData) {
      setCestas(cestasData);
    }

    // Visitas realizadas no mês atual
    const { data: visitasData, error: visitasError } = await supabase
      .from("visitas_domiciliares")
      .select("id, data_visita")
      .gte("data_visita", primeiroDia)
      .lte("data_visita", ultimoDia);
    if (!visitasError && visitasData) {
      setVisitas(visitasData);
    }

    setLoading(false);
  };

  const filteredAssistidos = assistidos.filter(
    (assistido) =>
      assistido.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistido.cpf.includes(searchTerm)
  );

  // Stats
  const totalAssistidos = assistidos.length;
  const ativos = assistidos.filter(a => a.status === "Ativo").length;
  const inativos = assistidos.filter(a => a.status === "Inativo").length;

  const stats = [
    {
      title: "Total de Assistidos",
      value: totalAssistidos.toLocaleString("pt-BR"),
      description: `${ativos} ativos, ${inativos} inativos`,
      icon: Users,
      trend: "up"
    },
    {
      title: "Cestas Entregues (Mês)",
      value: cestas.length.toLocaleString("pt-BR"),
      description: "Meta: 400 cestas",
      icon: Calendar,
      trend: "up"
    },
    {
      title: "Visitas Realizadas",
      value: visitas.length.toLocaleString("pt-BR"),
      description: "No mês atual",
      icon: TrendingUp,
      trend: "up"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao sistema de gestão social
          </p>
        </div>
        <Button className="w-fit" size="lg">
          <UserPlus className="w-4 h-4 mr-2" />
          Cadastrar Novo Assistido
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and List */}
      <Card>
        <CardHeader>
          <CardTitle>Assistidos Cadastrados</CardTitle>
          <CardDescription>
            Gerencie e visualize todos os assistidos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
              <div>Nome</div>
              <div>CPF</div>
              <div>Status</div>
              <div>Última Cesta</div>
              <div>Ações</div>
            </div>
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Carregando...</div>
            ) : filteredAssistidos.map((assistido) => (
              <div
                key={assistido.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
              >
                <div className="font-medium">{assistido.nome_completo}</div>
                <div className="text-muted-foreground">{assistido.cpf}</div>
                <div>
                  <Badge 
                    variant={assistido.status === "Ativo" ? "default" : "secondary"}
                    className={assistido.status === "Ativo" ? "bg-success text-success-foreground" : ""}
                  >
                    {assistido.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground">-</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Ver</Button>
                  <Button variant="outline" size="sm">Editar</Button>
                  <Button variant="outline" size="sm">Deletar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}