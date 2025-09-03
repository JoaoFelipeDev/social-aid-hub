import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Heart, Plus, Save, ArrowLeft, User, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AssistidoData {
  id: string;
  nome_completo: string;
  cpf: string;
  telefone: string | null;
  celular: string | null;
}

interface AcompanhamentoData {
  id?: string;
  assistido_id: string;
  tipo_cesta: string;
  periodicidade: string;
  inicio_recebimento: string;
  analise_assistencial: string;
  created_at?: string;
  updated_at?: string;
}

export default function Acompanhamento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assistidoId = searchParams.get('assistido');
  
  const [assistido, setAssistido] = useState<AssistidoData | null>(null);
  const [acompanhamento, setAcompanhamento] = useState<AcompanhamentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<AcompanhamentoData>>({
    tipo_cesta: "",
    periodicidade: "",
    inicio_recebimento: "",
    analise_assistencial: ""
  });

  useEffect(() => {
    if (assistidoId) {
      fetchAssistidoAndAcompanhamento();
    }
  }, [assistidoId]);

  const fetchAssistidoAndAcompanhamento = async () => {
    if (!assistidoId) return;

    try {
      setLoading(true);

      // Buscar dados do assistido
      const { data: assistidoData, error: assistidoError } = await supabase
        .from('assistidos')
        .select('id, nome_completo, cpf, telefone, celular')
        .eq('id', assistidoId)
        .single();

      if (assistidoError) throw assistidoError;
      setAssistido(assistidoData);

      // Buscar acompanhamento existente
      const { data: acompanhamentoData, error: acompanhamentoError } = await supabase
        .from('acompanhamento_assistencial')
        .select('*')
        .eq('assistido_id', assistidoId)
        .maybeSingle();

      if (acompanhamentoError) throw acompanhamentoError;
      
      if (acompanhamentoData) {
        setAcompanhamento(acompanhamentoData);
        setFormData({
          tipo_cesta: acompanhamentoData.tipo_cesta || "",
          periodicidade: acompanhamentoData.periodicidade || "",
          inicio_recebimento: acompanhamentoData.inicio_recebimento || "",
          analise_assistencial: acompanhamentoData.analise_assistencial || ""
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do assistido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!assistidoId) return;

    try {
      setSaving(true);

      const dataToSave = {
        assistido_id: assistidoId,
        tipo_cesta: formData.tipo_cesta,
        periodicidade: formData.periodicidade,
        inicio_recebimento: formData.inicio_recebimento,
        analise_assistencial: formData.analise_assistencial
      };

      if (acompanhamento) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('acompanhamento_assistencial')
          .update(dataToSave)
          .eq('id', acompanhamento.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Acompanhamento atualizado com sucesso!",
        });
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('acompanhamento_assistencial')
          .insert(dataToSave);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Acompanhamento criado com sucesso!",
        });
      }

      // Recarregar dados
      await fetchAssistidoAndAcompanhamento();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar acompanhamento",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!assistidoId) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Assistido não especificado</h2>
                <p className="text-muted-foreground mb-4">
                  Para acessar o acompanhamento, você precisa selecionar um assistido.
                </p>
                <Button onClick={() => navigate('/assistidos')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para Assistidos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="w-8 h-8 text-primary" />
              Acompanhamento Assistencial
            </h1>
            <p className="text-muted-foreground">
              {assistido ? `Gerenciar acompanhamento de ${assistido.nome_completo}` : "Carregando..."}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/assistidos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Assistidos
          </Button>
        </div>

        {assistido && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados do Assistido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                  <p className="font-medium">{assistido.nome_completo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                  <p className="font-medium">{assistido.cpf}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{assistido.celular || assistido.telefone || "Não informado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {acompanhamento ? "Editar Acompanhamento" : "Novo Acompanhamento"}
            </CardTitle>
            <CardDescription>
              {acompanhamento ? "Atualize as informações do acompanhamento assistencial" : "Defina o plano de acompanhamento para este assistido"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_cesta">Tipo de Cesta</Label>
                <Select 
                  value={formData.tipo_cesta} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_cesta: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de cesta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basica">Cesta Básica</SelectItem>
                    <SelectItem value="especial">Cesta Especial</SelectItem>
                    <SelectItem value="infantil">Cesta Infantil</SelectItem>
                    <SelectItem value="idoso">Cesta Idoso</SelectItem>
                    <SelectItem value="higiênica">Cesta Higiênica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodicidade">Periodicidade</Label>
                <Select 
                  value={formData.periodicidade} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, periodicidade: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a periodicidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="bimestral">Bimestral</SelectItem>
                    <SelectItem value="esporadica">Esporádica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inicio_recebimento">Data de Início do Recebimento</Label>
              <Input
                id="inicio_recebimento"
                type="date"
                value={formData.inicio_recebimento}
                onChange={(e) => setFormData(prev => ({ ...prev, inicio_recebimento: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="analise_assistencial">Análise Assistencial</Label>
              <Textarea
                id="analise_assistencial"
                placeholder="Descreva a situação e necessidades do assistido..."
                value={formData.analise_assistencial}
                onChange={(e) => setFormData(prev => ({ ...prev, analise_assistencial: e.target.value }))}
                rows={5}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {acompanhamento ? "Atualizar" : "Criar"} Acompanhamento
                  </>
                )}
              </Button>
              
              {acompanhamento && (
                <Badge variant="secondary" className="ml-auto">
                  <CalendarDays className="w-3 h-3 mr-1" />
                  Atualizado em {new Date(acompanhamento.updated_at || "").toLocaleDateString('pt-BR')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}