import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableRow, TableCell } from "@/components/ui/table";
import { ResponsiveTable } from "./ResponsiveTable";

const logs = [
  { id: 1, usuario: "Maria Silva", acao: "Cadastrou assistido", data: "2024-01-15 14:30", ip: "192.168.1.100" },
  { id: 2, usuario: "João Santos", acao: "Gerou relatório", data: "2024-01-15 13:45", ip: "192.168.1.101" },
  { id: 3, usuario: "Ana Costa", acao: "Atualizou dados", data: "2024-01-15 12:20", ip: "192.168.1.102" },
];

const columns = [
  { key: "usuario", header: "Usuário" },
  { key: "acao", header: "Ação" },
  { key: "data", header: "Data/Hora" },
  { key: "ip", header: "IP" },
];

export function AuditLogs() {
  const renderRow = (log: typeof logs[0]) => (
    <TableRow key={log.id}>
      <TableCell className="font-medium">{log.usuario}</TableCell>
      <TableCell>{log.acao}</TableCell>
      <TableCell>{log.data}</TableCell>
      <TableCell>{log.ip}</TableCell>
    </TableRow>
  );

  const renderMobileCard = (log: typeof logs[0]) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm">{log.usuario}</h3>
          <p className="text-sm text-muted-foreground">{log.acao}</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>{log.data}</span>
        <span>IP: {log.ip}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Auditoria e Logs</h2>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Ações</CardTitle>
          <CardDescription>Acompanhe todas as atividades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input placeholder="Buscar ação..." className="flex-1" />
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="semana">Esta semana</SelectItem>
                  <SelectItem value="mes">Este mês</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="w-full sm:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                Exportar Logs
              </Button>
            </div>

            <ResponsiveTable
              columns={columns}
              data={logs}
              renderRow={renderRow}
              renderMobileCard={renderMobileCard}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}