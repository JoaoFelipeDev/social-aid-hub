import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";
import { ResponsiveTable } from "./ResponsiveTable";

const usuarios = [
  { id: 1, nome: "Maria Silva", email: "maria@email.com", tipo: "Coordenador", status: "Ativo", ultimoAcesso: "2024-01-15" },
  { id: 2, nome: "João Santos", email: "joao@email.com", tipo: "Assistente Social", status: "Ativo", ultimoAcesso: "2024-01-14" },
  { id: 3, nome: "Ana Costa", email: "ana@email.com", tipo: "Operador", status: "Inativo", ultimoAcesso: "2024-01-10" },
];

const columns = [
  { key: "nome", header: "Nome" },
  { key: "email", header: "Email" },
  { key: "tipo", header: "Tipo" },
  { key: "status", header: "Status" },
  { key: "ultimoAcesso", header: "Último Acesso" },
  { key: "acoes", header: "Ações" },
];

export function UserManagement() {
  const renderRow = (usuario: typeof usuarios[0]) => (
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
  );

  const renderMobileCard = (usuario: typeof usuarios[0]) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{usuario.nome}</h3>
          <p className="text-sm text-muted-foreground">{usuario.email}</p>
        </div>
        <Badge variant={usuario.status === "Ativo" ? "default" : "secondary"}>
          {usuario.status}
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{usuario.tipo}</Badge>
        <span className="text-sm text-muted-foreground">Último acesso: {usuario.ultimoAcesso}</span>
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button size="sm" variant="outline" className="flex-1">Editar</Button>
        <Button size="sm" variant="outline" className="flex-1">Permissões</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Input placeholder="Buscar usuário..." className="flex-1" />
              <Select>
                <SelectTrigger className="w-full sm:w-40">
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

            <ResponsiveTable
              columns={columns}
              data={usuarios}
              renderRow={renderRow}
              renderMobileCard={renderMobileCard}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}