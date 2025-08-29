import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Save, User, Users, Home, DollarSign, Upload } from "lucide-react";
import { validateCPF, validateRG, validatePhone, formatCPF, formatRG, formatPhone, formatCEP } from "@/lib/validations";

interface FormData {
  // Dados pessoais
  cpf: string;
  nome_completo: string;
  data_nascimento: string;
  genero: string;
  estado_civil: string;
  rg: string;
  naturalidade: string;
  telefone: string;
  celular: string;
  encaminhado_por: string;
  foto_url: string;
  
  // Endereço
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  situacao_moradia: string;
  
  // Socioeconômico
  situacao_profissional: string;
  renda_familiar: string;
  beneficios_recebidos: string[];
  observacoes: string;
}

interface Familiar {
  id: string;
  nome: string;
  data_nascimento: string;
  parentesco: string;
  escolaridade: string;
  ocupacao: string;
  deficiencia: boolean;
  tipo_deficiencia: string;
  necessita_fralda: boolean;
  tamanho_fralda: string;
}

export default function CadastroAssistido() {
  const [activeTab, setActiveTab] = useState("dados-pessoais");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [familiares, setFamiliares] = useState<Familiar[]>([]);
  const [editingFamiliar, setEditingFamiliar] = useState<Familiar | null>(null);

  const [formData, setFormData] = useState<FormData>({
    cpf: "",
    nome_completo: "",
    data_nascimento: "",
    genero: "",
    estado_civil: "",
    rg: "",
    naturalidade: "",
    telefone: "",
    celular: "",
    encaminhado_por: "",
    foto_url: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    situacao_moradia: "",
    situacao_profissional: "",
    renda_familiar: "",
    beneficios_recebidos: [],
    observacoes: ""
  });

  // Estado para formulário de familiar
  const [familiarForm, setFamiliarForm] = useState({
    nome: "",
    data_nascimento: "",
    parentesco: "",
    escolaridade: "",
    ocupacao: "",
    deficiencia: false,
    tipo_deficiencia: "",
    necessita_fralda: false,
    tamanho_fralda: ""
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    // Aplicar formatação automática
    if (field === "cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "rg") {
      formattedValue = formatRG(value);
    } else if (field === "telefone" || field === "celular") {
      formattedValue = formatPhone(value);
    } else if (field === "cep") {
      formattedValue = formatCEP(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro quando campo é alterado
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFamiliarInputChange = (field: string, value: any) => {
    setFamiliarForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddFamiliar = () => {
    if (!familiarForm.nome || !familiarForm.parentesco) {
      toast({
        title: "Erro",
        description: "Nome e parentesco são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const novoFamiliar: Familiar = {
      id: Date.now().toString(),
      ...familiarForm
    };

    if (editingFamiliar) {
      setFamiliares(prev => prev.map(f => f.id === editingFamiliar.id ? { ...novoFamiliar, id: editingFamiliar.id } : f));
      setEditingFamiliar(null);
      toast({
        title: "Sucesso",
        description: "Familiar atualizado com sucesso!",
      });
    } else {
      setFamiliares(prev => [...prev, novoFamiliar]);
      toast({
        title: "Sucesso",
        description: "Familiar adicionado com sucesso!",
      });
    }

    // Limpar formulário
    setFamiliarForm({
      nome: "",
      data_nascimento: "",
      parentesco: "",
      escolaridade: "",
      ocupacao: "",
      deficiencia: false,
      tipo_deficiencia: "",
      necessita_fralda: false,
      tamanho_fralda: ""
    });
  };

  const handleEditFamiliar = (familiar: Familiar) => {
    setFamiliarForm({
      nome: familiar.nome,
      data_nascimento: familiar.data_nascimento,
      parentesco: familiar.parentesco,
      escolaridade: familiar.escolaridade,
      ocupacao: familiar.ocupacao,
      deficiencia: familiar.deficiencia,
      tipo_deficiencia: familiar.tipo_deficiencia,
      necessita_fralda: familiar.necessita_fralda,
      tamanho_fralda: familiar.tamanho_fralda
    });
    setEditingFamiliar(familiar);
  };

  const handleRemoveFamiliar = (id: string) => {
    setFamiliares(prev => prev.filter(f => f.id !== id));
    toast({
      title: "Sucesso",
      description: "Familiar removido com sucesso!",
    });
  };

  const handleBeneficioChange = (beneficio: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      beneficios_recebidos: checked 
        ? [...prev.beneficios_recebidos, beneficio]
        : prev.beneficios_recebidos.filter(b => b !== beneficio)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validações obrigatórias
    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.nome_completo) {
      newErrors.nome_completo = "Nome completo é obrigatório";
    }

    if (formData.rg && !validateRG(formData.rg)) {
      newErrors.rg = "RG inválido";
    }

    if (formData.telefone && !validatePhone(formData.telefone)) {
      newErrors.telefone = "Telefone inválido";
    }

    if (formData.celular && !validatePhone(formData.celular)) {
      newErrors.celular = "Celular inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `assistidos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assistidos-fotos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('assistidos-fotos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Erro no upload da foto:', error);
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    const photoUrl = await uploadPhoto(file);
    if (photoUrl) {
      setFormData(prev => ({ ...prev, foto_url: photoUrl }));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setCameraStream(stream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          const photoUrl = await uploadPhoto(file);
          if (photoUrl) {
            setFormData(prev => ({ ...prev, foto_url: photoUrl }));
            setPhotoPreview(canvas.toDataURL());
          }
        }
      }, 'image/jpeg', 0.8);
    }

    stopCamera();
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handleSaveAssistido = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Inserir assistido
      const { data: assistidoData, error: assistidoError } = await supabase
        .from('assistidos')
        .insert({
          cpf: formData.cpf.replace(/[^\d]/g, ''),
          nome_completo: formData.nome_completo,
          data_nascimento: formData.data_nascimento || null,
          genero: formData.genero || null,
          estado_civil: formData.estado_civil || null,
          rg: formData.rg || null,
          naturalidade: formData.naturalidade || null,
          telefone: formData.telefone || null,
          celular: formData.celular || null,
          encaminhado_por: formData.encaminhado_por || null,
          foto_url: formData.foto_url || null,
          rua: formData.rua || null,
          numero: formData.numero || null,
          bairro: formData.bairro || null,
          cidade: formData.cidade || null,
          estado: formData.estado || null,
          cep: formData.cep || null,
          situacao_moradia: formData.situacao_moradia || null,
          status: 'Ativo'
        })
        .select()
        .single();

      if (assistidoError) {
        throw assistidoError;
      }

      // Inserir perfil socioeconômico se há dados
      if (formData.situacao_profissional || formData.renda_familiar || formData.beneficios_recebidos.length > 0) {
        const { error: perfilError } = await supabase
          .from('perfil_socioeconomico')
          .insert({
            assistido_id: assistidoData.id,
            situacao_profissional: formData.situacao_profissional || null,
            renda_familiar: formData.renda_familiar ? parseFloat(formData.renda_familiar.replace(/[^\d.,]/g, '').replace(',', '.')) : null,
            beneficios_recebidos: formData.beneficios_recebidos.length > 0 ? formData.beneficios_recebidos : null,
            observacoes: formData.observacoes || null
          });

        if (perfilError) {
          console.error('Erro ao salvar perfil socioeconômico:', perfilError);
        }
      }

      // Inserir familiares se há dados
      if (familiares.length > 0) {
        const familiaresData = familiares.map(familiar => ({
          assistido_id: assistidoData.id,
          nome: familiar.nome,
          data_nascimento: familiar.data_nascimento || null,
          parentesco: familiar.parentesco,
          escolaridade: familiar.escolaridade || null,
          ocupacao: familiar.ocupacao || null,
          deficiencia: familiar.deficiencia,
          tipo_deficiencia: familiar.deficiencia ? familiar.tipo_deficiencia : null,
          necessita_fralda: familiar.necessita_fralda,
          tamanho_fralda: familiar.necessita_fralda ? familiar.tamanho_fralda : null
        }));

        const { error: familiaresError } = await supabase
          .from('familiares')
          .insert(familiaresData);

        if (familiaresError) {
          console.error('Erro ao salvar familiares:', familiaresError);
        }
      }

      toast({
        title: "Sucesso",
        description: "Assistido cadastrado com sucesso!",
      });

      navigate("/");
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFamiliares = async () => {
    toast({
      title: "Info",
      description: "Para salvar familiares, complete primeiro os dados pessoais e finalize o cadastro.",
    });
  };

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
                  <Input 
                    id="cpf" 
                    placeholder="000.000.000-00" 
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    className={errors.cpf ? "border-destructive" : ""}
                    required 
                  />
                  {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input 
                    id="nome" 
                    placeholder="Nome completo" 
                    value={formData.nome_completo}
                    onChange={(e) => handleInputChange("nome_completo", e.target.value)}
                    className={errors.nome_completo ? "border-destructive" : ""}
                    required 
                  />
                  {errors.nome_completo && <p className="text-sm text-destructive">{errors.nome_completo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nascimento">Data de Nascimento</Label>
                  <Input 
                    id="nascimento" 
                    type="date" 
                    value={formData.data_nascimento}
                    onChange={(e) => handleInputChange("data_nascimento", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genero">Gênero</Label>
                  <Select value={formData.genero} onValueChange={(value) => handleInputChange("genero", value)}>
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
                  <Select value={formData.estado_civil} onValueChange={(value) => handleInputChange("estado_civil", value)}>
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
                  <Input 
                    id="rg" 
                    placeholder="00.000.000-0" 
                    value={formData.rg}
                    onChange={(e) => handleInputChange("rg", e.target.value)}
                    className={errors.rg ? "border-destructive" : ""}
                  />
                  {errors.rg && <p className="text-sm text-destructive">{errors.rg}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naturalidade">Naturalidade</Label>
                  <Input 
                    id="naturalidade" 
                    placeholder="Cidade - Estado" 
                    value={formData.naturalidade}
                    onChange={(e) => handleInputChange("naturalidade", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone/Celular</Label>
                  <Input 
                    id="telefone" 
                    placeholder="(00) 00000-0000" 
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    className={errors.telefone ? "border-destructive" : ""}
                  />
                  {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="encaminhado">Encaminhado por</Label>
                <Select value={formData.encaminhado_por} onValueChange={(value) => handleInputChange("encaminhado_por", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Como chegou até nós?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Espontâneo">Espontâneo</SelectItem>
                    <SelectItem value="Oficina">Oficina</SelectItem>
                    <SelectItem value="Albergue">Albergue</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Foto do Assistido</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={startCamera}>
                      <Camera className="w-4 h-4 mr-2" />
                      Tirar Foto
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {showCamera && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-sm mx-auto rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex gap-2 justify-center">
                    <Button onClick={capturePhoto}>Capturar</Button>
                    <Button variant="outline" onClick={stopCamera}>Cancelar</Button>
                  </div>
                </div>
              )}
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
                  <Input 
                    id="rua" 
                    placeholder="Nome da rua" 
                    value={formData.rua}
                    onChange={(e) => handleInputChange("rua", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input 
                    id="numero" 
                    placeholder="Número da casa" 
                    value={formData.numero}
                    onChange={(e) => handleInputChange("numero", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input 
                    id="bairro" 
                    placeholder="Nome do bairro" 
                    value={formData.bairro}
                    onChange={(e) => handleInputChange("bairro", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input 
                    id="cidade" 
                    placeholder="Nome da cidade" 
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input 
                    id="estado" 
                    placeholder="UF" 
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input 
                    id="cep" 
                    placeholder="00000-000" 
                    value={formData.cep}
                    onChange={(e) => handleInputChange("cep", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Situação da Moradia</Label>
                <Select value={formData.situacao_moradia} onValueChange={(value) => handleInputChange("situacao_moradia", value)}>
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
                  <Select value={formData.situacao_profissional} onValueChange={(value) => handleInputChange("situacao_profissional", value)}>
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
                  <Input 
                    id="renda" 
                    placeholder="R$ 0,00" 
                    value={formData.renda_familiar}
                    onChange={(e) => handleInputChange("renda_familiar", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Benefícios Recebidos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Bolsa Família',
                    'LOAS',
                    'Aposentadoria',
                    'Auxílio Doença',
                    'Seguro Desemprego',
                    'Outros'
                  ].map((beneficio) => (
                    <div key={beneficio} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={beneficio.toLowerCase().replace(' ', '-')}
                        checked={formData.beneficios_recebidos.includes(beneficio)}
                        onChange={(e) => handleBeneficioChange(beneficio, e.target.checked)}
                      />
                      <Label htmlFor={beneficio.toLowerCase().replace(' ', '-')}>{beneficio}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações Gerais</Label>
                <Textarea 
                  placeholder="Informações adicionais sobre a situação socioeconômica da família..."
                  rows={4}
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="familia">
          <Card>
            <CardHeader>
              <CardTitle>Composição Familiar</CardTitle>
              <CardDescription>
                Cadastre os membros da família do assistido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Formulário de Familiar */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">
                  {editingFamiliar ? "Editar Familiar" : "Adicionar Familiar"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="familiar-nome">Nome *</Label>
                    <Input 
                      id="familiar-nome"
                      placeholder="Nome completo do familiar"
                      value={familiarForm.nome}
                      onChange={(e) => handleFamiliarInputChange("nome", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="familiar-parentesco">Parentesco *</Label>
                    <Select 
                      value={familiarForm.parentesco} 
                      onValueChange={(value) => handleFamiliarInputChange("parentesco", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parentesco" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conjuge">Cônjuge</SelectItem>
                        <SelectItem value="filho">Filho(a)</SelectItem>
                        <SelectItem value="pai">Pai</SelectItem>
                        <SelectItem value="mae">Mãe</SelectItem>
                        <SelectItem value="irmao">Irmão/Irmã</SelectItem>
                        <SelectItem value="avo">Avô/Avó</SelectItem>
                        <SelectItem value="neto">Neto(a)</SelectItem>
                        <SelectItem value="tio">Tio(a)</SelectItem>
                        <SelectItem value="sobrinho">Sobrinho(a)</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="familiar-nascimento">Data de Nascimento</Label>
                    <Input 
                      id="familiar-nascimento"
                      type="date"
                      value={familiarForm.data_nascimento}
                      onChange={(e) => handleFamiliarInputChange("data_nascimento", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="familiar-escolaridade">Escolaridade</Label>
                    <Select 
                      value={familiarForm.escolaridade} 
                      onValueChange={(value) => handleFamiliarInputChange("escolaridade", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a escolaridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao_alfabetizado">Não Alfabetizado</SelectItem>
                        <SelectItem value="fundamental_incompleto">Fundamental Incompleto</SelectItem>
                        <SelectItem value="fundamental_completo">Fundamental Completo</SelectItem>
                        <SelectItem value="medio_incompleto">Médio Incompleto</SelectItem>
                        <SelectItem value="medio_completo">Médio Completo</SelectItem>
                        <SelectItem value="superior_incompleto">Superior Incompleto</SelectItem>
                        <SelectItem value="superior_completo">Superior Completo</SelectItem>
                        <SelectItem value="pos_graduacao">Pós-Graduação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="familiar-ocupacao">Ocupação</Label>
                    <Input 
                      id="familiar-ocupacao"
                      placeholder="Profissão ou ocupação"
                      value={familiarForm.ocupacao}
                      onChange={(e) => handleFamiliarInputChange("ocupacao", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="familiar-deficiencia"
                        checked={familiarForm.deficiencia}
                        onChange={(e) => handleFamiliarInputChange("deficiencia", e.target.checked)}
                      />
                      <Label htmlFor="familiar-deficiencia">Possui deficiência</Label>
                    </div>
                    
                    {familiarForm.deficiencia && (
                      <div className="space-y-2">
                        <Label htmlFor="tipo-deficiencia">Tipo de Deficiência</Label>
                        <Input 
                          id="tipo-deficiencia"
                          placeholder="Descreva o tipo de deficiência"
                          value={familiarForm.tipo_deficiencia}
                          onChange={(e) => handleFamiliarInputChange("tipo_deficiencia", e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="familiar-fralda"
                        checked={familiarForm.necessita_fralda}
                        onChange={(e) => handleFamiliarInputChange("necessita_fralda", e.target.checked)}
                      />
                      <Label htmlFor="familiar-fralda">Necessita fralda</Label>
                    </div>
                    
                    {familiarForm.necessita_fralda && (
                      <div className="space-y-2">
                        <Label htmlFor="tamanho-fralda">Tamanho da Fralda</Label>
                        <Select 
                          value={familiarForm.tamanho_fralda} 
                          onValueChange={(value) => handleFamiliarInputChange("tamanho_fralda", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tamanho" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="P">P - Pequeno</SelectItem>
                            <SelectItem value="M">M - Médio</SelectItem>
                            <SelectItem value="G">G - Grande</SelectItem>
                            <SelectItem value="GG">GG - Extra Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddFamiliar}>
                    {editingFamiliar ? "Atualizar" : "Adicionar"} Familiar
                  </Button>
                  {editingFamiliar && (
                    <Button variant="outline" onClick={() => {
                      setEditingFamiliar(null);
                      setFamiliarForm({
                        nome: "",
                        data_nascimento: "",
                        parentesco: "",
                        escolaridade: "",
                        ocupacao: "",
                        deficiencia: false,
                        tipo_deficiencia: "",
                        necessita_fralda: false,
                        tamanho_fralda: ""
                      });
                    }}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Lista de Familiares */}
              {familiares.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Familiares Cadastrados</h3>
                  <div className="space-y-3">
                    {familiares.map((familiar) => (
                      <div key={familiar.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            <div>
                              <p className="font-medium">{familiar.nome}</p>
                              <p className="text-sm text-muted-foreground">{familiar.parentesco}</p>
                            </div>
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Nascimento:</span> {familiar.data_nascimento || "Não informado"}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Escolaridade:</span> {familiar.escolaridade || "Não informada"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">Ocupação:</span> {familiar.ocupacao || "Não informada"}
                              </p>
                              {familiar.deficiencia && (
                                <p className="text-sm text-orange-600">
                                  Deficiência: {familiar.tipo_deficiencia}
                                </p>
                              )}
                              {familiar.necessita_fralda && (
                                <p className="text-sm text-blue-600">
                                  Fralda: {familiar.tamanho_fralda}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditFamiliar(familiar)}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleRemoveFamiliar(familiar.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => navigate("/")}>Cancelar</Button>
        <Button 
          className="bg-success text-success-foreground hover:bg-success/90"
          onClick={handleSaveAssistido}
          disabled={isLoading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Salvando..." : "Salvar Cadastro"}
        </Button>
      </div>
    </div>
  );
}