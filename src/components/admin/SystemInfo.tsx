import { Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function SystemInfo() {
  return (
    <div className="space-y-6">
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex-1">
                <Database className="w-4 h-4 mr-2" />
                Fazer Backup
              </Button>
              <Button variant="outline" className="flex-1">Restaurar</Button>
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
              {[
                { label: "Total de Assistidos", value: "1,247" },
                { label: "Cestas Entregues", value: "3,891" },
                { label: "Usuários Ativos", value: "12" },
                { label: "Visitas Realizadas", value: "567" }
              ].map((stat) => (
                <div key={stat.label} className="text-center p-3 border rounded-lg">
                  <Label className="text-xs text-muted-foreground">{stat.label}</Label>
                  <p className="text-xl font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manutenção</CardTitle>
            <CardDescription>Ferramentas de manutenção do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Limpar Cache", "Verificar Integridade", "Otimizar Banco"].map((action) => (
              <Button key={action} variant="outline" className="w-full justify-start">
                {action}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
            <CardDescription>Detalhes técnicos da aplicação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Versão", value: "1.0.0" },
              { label: "Último Update", value: "15/01/2024" },
              { label: "Uptime", value: "7 dias" },
              { label: "Servidor", value: "Online" }
            ].map((info) => (
              <div key={info.label} className="flex justify-between items-center py-1">
                <span className="text-sm text-muted-foreground">{info.label}:</span>
                <span className="text-sm font-medium">{info.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}