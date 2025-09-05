import { useState } from "react";
import { Users, Settings, FileText, Shield, Database, Bell, MapPin, Tags } from "lucide-react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Admin() {
  const [activeSection, setActiveSection] = useState("usuarios");

  // Mock data
  const usuarios = [
    { id: 1, nome: "Maria Silva", email: "maria@email.com", tipo: "Coordenador", status: "Ativo", ultimoAcesso: "2024-01-15" },
    { id: 2, nome: "João Santos", email: "joao@email.com", tipo: "Assistente Social", status: "Ativo", ultimoAcesso: "2024-01-14" },
    { id: 3, nome: "Ana Costa", email: "ana@email.com", tipo: "Operador", status: "Inativo", ultimoAcesso: "2024-01-10" },
  ];

  const logs = [
    { id: 1, usuario: "Maria Silva", acao: "Cadastrou assistido", data: "2024-01-15 14:30", ip: "192.168.1.100" },
    { id: 2, usuario: "João Santos", acao: "Gerou relatório", data: "2024-01-15 13:45", ip: "192.168.1.101" },
    { id: 3, usuario: "Ana Costa", acao: "Atualizou dados", data: "2024-01-15 12:20", ip: "192.168.1.102" },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administração</h1>
          <p className="text-muted-foreground">Gerencie configurações e usuários do sistema</p>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usuarios">
              <Users className="w-4 h-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="configuracoes">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="auditoria">
              <Shield className="w-4 h-4 mr-2" />
              Auditoria
            </TabsTrigger>
            <TabsTrigger value="sistema">
              <Database className="w-4 h-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Gestão de Usuários</h2>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>Gerencie permissões e acesso dos usuários</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input placeholder="Buscar usuário..." className="max-w-sm" />
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="coordenador">Coordenador</SelectItem>
                        <SelectItem value="assistente">Assistente Social</SelectItem>
                        <SelectItem value="operador">Operador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Acesso</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">{usuario.nome}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{usuario.tipo}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={usuario.status === "Ativo" ? "default" : "secondary"}>
                              {usuario.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{usuario.ultimoAcesso}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">Editar</Button>
                              <Button size="sm" variant="outline">Permissões</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <h2 className="text-2xl font-semibold">Configurações do Sistema</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                  <CardDescription>Configurações básicas do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome-org">Nome da Organização</Label>
                    <Input id="nome-org" defaultValue="Centro Social Comunitário" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-org">Email Institucional</Label>
                    <Input id="email-org" type="email" defaultValue="contato@centrosocial.org" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone-org">Telefone</Label>
                    <Input id="telefone-org" defaultValue="(11) 3456-7890" />
                  </div>
                  <Button>Salvar Configurações</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Cesta</CardTitle>
                  <CardDescription>Configure os tipos de cestas disponíveis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipos Disponíveis</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Cesta Básica</span>
                        <Button size="sm" variant="ghost">Editar</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Cesta Especial</span>
                        <Button size="sm" variant="ghost">Editar</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Kit Higiene</span>
                        <Button size="sm" variant="ghost">Editar</Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Tags className="w-4 h-4 mr-2" />
                    Adicionar Tipo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>Configure alertas e notificações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Alertas de Retirada</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre cestas em atraso</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Relatórios Automáticos</Label>
                      <p className="text-sm text-muted-foreground">Enviar relatórios mensais</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">Backup diário dos dados</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Regiões de Atendimento</CardTitle>
                  <CardDescription>Configure as áreas de cobertura</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bairros Atendidos</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Centro</span>
                        <Button size="sm" variant="ghost">Remover</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Vila Nova</span>
                        <Button size="sm" variant="ghost">Remover</Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span>Jardim Esperança</span>
                        <Button size="sm" variant="ghost">Remover</Button>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <MapPin className="w-4 h-4 mr-2" />
                    Adicionar Região
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="auditoria" className="space-y-6">
            <h2 className="text-2xl font-semibold">Auditoria e Logs</h2>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ações</CardTitle>
                <CardDescription>Acompanhe todas as atividades do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input placeholder="Buscar ação..." className="max-w-sm" />
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Esta semana</SelectItem>
                        <SelectItem value="mes">Este mês</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Exportar Logs
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.usuario}</TableCell>
                          <TableCell>{log.acao}</TableCell>
                          <TableCell>{log.data}</TableCell>
                          <TableCell>{log.ip}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-6">
            <h2 className="text-2xl font-semibold">Sistema</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Backup e Restauração</CardTitle>
                  <CardDescription>Gerencie backups dos dados do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Último Backup</Label>
                    <p className="text-sm text-muted-foreground">15/01/2024 às 03:00</p>
                  </div>
                  <div className="flex gap-2">
                    <Button>
                      <Database className="w-4 h-4 mr-2" />
                      Fazer Backup
                    </Button>
                    <Button variant="outline">Restaurar</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas do Sistema</CardTitle>
                  <CardDescription>Informações sobre o uso do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Total de Assistidos</Label>
                      <p className="text-2xl font-bold">1,247</p>
                    </div>
                    <div>
                      <Label>Cestas Entregues</Label>
                      <p className="text-2xl font-bold">3,891</p>
                    </div>
                    <div>
                      <Label>Usuários Ativos</Label>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <div>
                      <Label>Visitas Realizadas</Label>
                      <p className="text-2xl font-bold">567</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manutenção</CardTitle>
                  <CardDescription>Ferramentas de manutenção do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Limpar Cache
                  </Button>
                  <Button variant="outline" className="w-full">
                    Verificar Integridade
                  </Button>
                  <Button variant="outline" className="w-full">
                    Otimizar Banco
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                  <CardDescription>Detalhes técnicos da aplicação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Versão:</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Último Update:</span>
                    <span>15/01/2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span>7 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Servidor:</span>
                    <span>Online</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}