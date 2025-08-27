import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users, Calendar, TrendingUp } from "lucide-react";

// Mock data for demonstration
const assistidos = [
  {
    id: 1,
    nome: "Maria Silva Santos",
    cpf: "123.456.789-00",
    status: "Ativo",
    ultimaCesta: "15/12/2024",
  },
  {
    id: 2,
    nome: "João Oliveira Costa",
    cpf: "987.654.321-00",
    status: "Ativo", 
    ultimaCesta: "10/12/2024",
  },
  {
    id: 3,
    nome: "Ana Paula Ferreira",
    cpf: "456.789.123-00",
    status: "Inativo",
    ultimaCesta: "28/11/2024",
  },
];

const stats = [
  {
    title: "Total de Assistidos",
    value: "1,247",
    description: "+12% em relação ao mês anterior",
    icon: Users,
    trend: "up"
  },
  {
    title: "Cestas Entregues (Mês)",
    value: "342",
    description: "Meta: 400 cestas",
    icon: Calendar,
    trend: "up"
  },
  {
    title: "Visitas Realizadas",
    value: "89",
    description: "+5% em relação ao mês anterior",
    icon: TrendingUp,
    trend: "up"
  },
];

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssistidos = assistidos.filter(
    (assistido) =>
      assistido.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assistido.cpf.includes(searchTerm)
  );

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
            
            {filteredAssistidos.map((assistido) => (
              <div
                key={assistido.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
              >
                <div className="font-medium">{assistido.nome}</div>
                <div className="text-muted-foreground">{assistido.cpf}</div>
                <div>
                  <Badge 
                    variant={assistido.status === "Ativo" ? "default" : "secondary"}
                    className={assistido.status === "Ativo" ? "bg-success text-success-foreground" : ""}
                  >
                    {assistido.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground">{assistido.ultimaCesta}</div>
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