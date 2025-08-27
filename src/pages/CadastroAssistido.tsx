import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save, User, Users, Home, DollarSign } from "lucide-react";

export default function CadastroAssistido() {
  const [activeTab, setActiveTab] = useState("dados-pessoais");
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <User className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cadastro de Assistido</h1>
          <p className="text-muted-foreground">
            Preencha os dados completos do novo assistido
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados-pessoais" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="familia" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Família
          </TabsTrigger>
          <TabsTrigger value="endereco" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Endereço
          </TabsTrigger>
          <TabsTrigger value="socioeconomico" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Socioeconômico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados-pessoais">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                Informações básicas do assistido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input id="cpf" placeholder="000.000.000-00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" placeholder="Nome completo" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nascimento">Data de Nascimento</Label>
                  <Input id="nascimento" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genero">Gênero</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado-civil">Estado Civil</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG</Label>
                  <Input id="rg" placeholder="00.000.000-0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naturalidade">Naturalidade</Label>
                  <Input id="naturalidade" placeholder="Cidade - Estado" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone/Celular</Label>
                  <Input id="telefone" placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="encaminhado">Encaminhado por</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Como chegou até nós?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="espontaneo">Espontâneo</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="albergue">Albergue</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Foto do Assistido</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Tirar Foto
                    </Button>
                    <Button variant="outline" size="sm">
                      Fazer Upload
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="familia">
          <Card>
            <CardHeader>
              <CardTitle>Composição Familiar</CardTitle>
              <CardDescription>
                Dados dos membros da família
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Membros da Família</h3>
                  <Button variant="outline" size="sm">
                    + Adicionar Membro
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input placeholder="Nome do familiar" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Nascimento</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Parentesco</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conjuge">Cônjuge</SelectItem>
                          <SelectItem value="filho">Filho(a)</SelectItem>
                          <SelectItem value="pai">Pai</SelectItem>
                          <SelectItem value="mae">Mãe</SelectItem>
                          <SelectItem value="irmao">Irmão(ã)</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Escolaridade</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="analfabeto">Analfabeto</SelectItem>
                          <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                          <SelectItem value="medio">Ensino Médio</SelectItem>
                          <SelectItem value="superior">Ensino Superior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ocupação</Label>
                      <Input placeholder="Profissão/Ocupação" />
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">
                    Remover
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4</div>
                  <div className="text-sm text-muted-foreground">Total de membros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">2</div>
                  <div className="text-sm text-muted-foreground">Crianças (0-12)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">1</div>
                  <div className="text-sm text-muted-foreground">Adolescentes (13-17)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">1</div>
                  <div className="text-sm text-muted-foreground">Idosos (60+)</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Necessidades Especiais</Label>
                <Textarea placeholder="Descreva deficiências, necessidade de fraldas, tamanhos especiais, etc." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endereco">
          <Card>
            <CardHeader>
              <CardTitle>Endereço e Moradia</CardTitle>
              <CardDescription>
                Localização e situação da moradia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rua">Rua/Avenida</Label>
                  <Input id="rua" placeholder="Nome da rua" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" placeholder="Número da casa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" placeholder="Nome do bairro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" placeholder="Nome da cidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" placeholder="UF" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" placeholder="00000-000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Situação da Moradia</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="propria">Própria</SelectItem>
                    <SelectItem value="alugada">Alugada</SelectItem>
                    <SelectItem value="cedida">Cedida</SelectItem>
                    <SelectItem value="financiada">Financiada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Complemento/Referência</Label>
                <Textarea placeholder="Informações adicionais sobre a localização" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="socioeconomico">
          <Card>
            <CardHeader>
              <CardTitle>Perfil Socioeconômico</CardTitle>
              <CardDescription>
                Situação financeira e benefícios sociais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Situação Profissional</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empregado">Empregado</SelectItem>
                      <SelectItem value="desempregado">Desempregado</SelectItem>
                      <SelectItem value="informal">Trabalho Informal</SelectItem>
                      <SelectItem value="aposentado">Aposentado</SelectItem>
                      <SelectItem value="autonomo">Autônomo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renda">Renda Familiar Total</Label>
                  <Input id="renda" placeholder="R$ 0,00" />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Benefícios Recebidos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="bolsa-familia" />
                    <Label htmlFor="bolsa-familia">Bolsa Família</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="loas" />
                    <Label htmlFor="loas">LOAS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="aposentadoria" />
                    <Label htmlFor="aposentadoria">Aposentadoria</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="aux-doenca" />
                    <Label htmlFor="aux-doenca">Auxílio Doença</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="seguro-desemprego" />
                    <Label htmlFor="seguro-desemprego">Seguro Desemprego</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="outros-beneficios" />
                    <Label htmlFor="outros-beneficios">Outros</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações Gerais</Label>
                <Textarea 
                  placeholder="Informações adicionais sobre a situação socioeconômica da família..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => navigate("/")}>Cancelar</Button>
        <Button className="bg-success text-success-foreground hover:bg-success/90">
          <Save className="w-4 h-4 mr-2" />
          Salvar Cadastro
        </Button>
      </div>
    </div>
  );
}