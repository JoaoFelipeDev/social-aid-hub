import { Tags, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function SystemSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Configurações do Sistema</h2>

      <div className="grid gap-6 lg:grid-cols-2">
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
            <Button className="w-full sm:w-auto">Salvar Configurações</Button>
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
                {["Cesta Básica", "Cesta Especial", "Kit Higiene"].map((tipo) => (
                  <div key={tipo} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{tipo}</span>
                    <Button size="sm" variant="ghost">Editar</Button>
                  </div>
                ))}
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
            {[
              { title: "Alertas de Retirada", description: "Notificar sobre cestas em atraso" },
              { title: "Relatórios Automáticos", description: "Enviar relatórios mensais" },
              { title: "Backup Automático", description: "Backup diário dos dados" }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{item.title}</Label>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                {index < 2 && <Separator className="my-2" />}
              </div>
            ))}
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
                {["Centro", "Vila Nova", "Jardim Esperança"].map((bairro) => (
                  <div key={bairro} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{bairro}</span>
                    <Button size="sm" variant="ghost">Remover</Button>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" />
              Adicionar Região
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}