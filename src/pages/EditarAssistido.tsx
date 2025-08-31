import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Save, User, Users, Home, DollarSign, Upload, ArrowLeft } from "lucide-react";
import { validateCPF, validateRG, validatePhone, formatCPF, formatRG, formatPhone, formatCEP } from "@/lib/validations";
import Layout from "@/components/Layout";

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
  assistido_id?: string;
}

export default function EditarAssistido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dados-pessoais");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
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

  useEffect(() => {
    if (id) {
      fetchAssistido(id);
    }
  }, [id]);

  const fetchAssistido = async (assistidoId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assistidos')
        .select(`
          *,
          familiares(*),
          perfil_socioeconomico(*)
        `)
        .eq('id', assistidoId)
        .single();

      if (error) {
        throw error;
      }

      // Preencher dados do assistido
      setFormData({
        cpf: formatCPF(data.cpf || ''),
        nome_completo: data.nome_completo || '',
        data_nascimento: data.data_nascimento || '',
        genero: data.genero || '',
        estado_civil: data.estado_civil || '',
        rg: data.rg || '',
        naturalidade: data.naturalidade || '',
        telefone: data.telefone || '',
        celular: data.celular || '',
        encaminhado_por: data.encaminhado_por || '',
        foto_url: data.foto_url || '',
        rua: data.rua || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        cep: data.cep || '',
        situacao_moradia: data.situacao_moradia || '',
        situacao_profissional: data.perfil_socioeconomico?.[0]?.situacao_profissional || '',
        renda_familiar: data.perfil_socioeconomico?.[0]?.renda_familiar?.toString() || '',
        beneficios_recebidos: data.perfil_socioeconomico?.[0]?.beneficios_recebidos || [],
        observacoes: data.perfil_socioeconomico?.[0]?.observacoes || ''
      });

      // Definir foto preview se existe
      if (data.foto_url) {
        setPhotoPreview(data.foto_url);
      }

      // Preencher familiares
      setFamiliares(data.familiares || []);

    } catch (error) {
      console.error('Erro ao carregar assistido:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do assistido",
        variant: "destructive",
      });
      navigate('/assistidos');
    } finally {
      setLoading(false);
    }
  };

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
      setFamiliares(prev => prev.map(f => f.id === editingFamiliar.id ? { ...novoFamiliar, id: editingFamiliar.id, assistido_id: editingFamiliar.assistido_id } : f));
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

  const handleUpdateAssistido = async () => {
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
      // Atualizar assistido
      const { error: assistidoError } = await supabase
        .from('assistidos')
        .update({
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
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (assistidoError) {
        throw assistidoError;
      }

      // Atualizar perfil socioeconômico
      if (formData.situacao_profissional || formData.renda_familiar || formData.beneficios_recebidos.length > 0) {
        const { error: perfilError } = await supabase
          .from('perfil_socioeconomico')
          .upsert({
            assistido_id: id,
            situacao_profissional: formData.situacao_profissional || null,
            renda_familiar: formData.renda_familiar ? parseFloat(formData.renda_familiar.replace(/[^\d.,]/g, '').replace(',', '.')) : null,
            beneficios_recebidos: formData.beneficios_recebidos.length > 0 ? formData.beneficios_recebidos : null,
            observacoes: formData.observacoes || null
          }, {
            onConflict: 'assistido_id'
          });

        if (perfilError) {
          console.error('Erro ao salvar perfil socioeconômico:', perfilError);
        }
      }

      // Deletar familiares existentes e inserir novos
      await supabase
        .from('familiares')
        .delete()
        .eq('assistido_id', id);

      if (familiares.length > 0) {
        const familiaresData = familiares.map(familiar => ({
          assistido_id: id,
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
        description: "Assistido atualizado com sucesso!",
      });

      navigate(`/assistidos/${id}`);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/assistidos')}>
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <User className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Assistido</h1>
            <p className="text-muted-foreground">
              Edite os dados do assistido {formData.nome_completo}
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
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className={errors.cpf ? "border-red-500" : ""}
                    />
                    {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome_completo">Nome Completo *</Label>
                    <Input
                      id="nome_completo"
                      value={formData.nome_completo}
                      onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                      placeholder="Digite o nome completo"
                      className={errors.nome_completo ? "border-red-500" : ""}
                    />
                    {errors.nome_completo && <p className="text-sm text-red-500">{errors.nome_completo}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input
                      id="data_nascimento"
                      type="date"
                      value={formData.data_nascimento}
                      onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genero">Gênero</Label>
                    <Select
                      value={formData.genero}
                      onValueChange={(value) => handleInputChange('genero', value)}
                    >
                      <SelectTrigger id="genero">
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_civil">Estado Civil</Label>
                    <Select
                      value={formData.estado_civil}
                      onValueChange={(value) => handleInputChange('estado_civil', value)}
                    >
                      <SelectTrigger id="estado_civil">
                        <SelectValue placeholder="Selecione o estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                        <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                        <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                        <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rg">RG</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => handleInputChange('rg', e.target.value)}
                      placeholder="Digite o RG"
                      maxLength={12}
                      className={errors.rg ? "border-red-500" : ""}
                    />
                    {errors.rg && <p className="text-sm text-red-500">{errors.rg}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="naturalidade">Naturalidade</Label>
                    <Input
                      id="naturalidade"
                      value={formData.naturalidade}
                      onChange={(e) => handleInputChange('naturalidade', e.target.value)}
                      placeholder="Cidade de nascimento"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(00) 0000-0000"
                      maxLength={14}
                      className={errors.telefone ? "border-red-500" : ""}
                    />
                    {errors.telefone && <p className="text-sm text-red-500">{errors.telefone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={(e) => handleInputChange('celular', e.target.value)}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className={errors.celular ? "border-red-500" : ""}
                    />
                    {errors.celular && <p className="text-sm text-red-500">{errors.celular}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encaminhado_por">Encaminhado Por</Label>
                    <Input
                      id="encaminhado_por"
                      value={formData.encaminhado_por}
                      onChange={(e) => handleInputChange('encaminhado_por', e.target.value)}
                      placeholder="Quem encaminhou"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Foto</Label>
                    <div className="flex items-center gap-4">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Foto do assistido" className="w-24 h-24 object-cover rounded" />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                          Sem foto
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => fileInputRef.current?.click()} leftIcon={<Upload />}>Selecionar Foto</Button>
                        <Button variant="outline" onClick={startCamera} leftIcon={<Camera />}>Usar Câmera</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="familia">
            <Card>
              <CardHeader>
                <CardTitle>Família</CardTitle>
                <CardDescription>Adicione ou edite familiares do assistido</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="familiar_nome">Nome *</Label>
                      <Input
                        id="familiar_nome"
                        value={familiarForm.nome}
                        onChange={(e) => handleFamiliarInputChange('nome', e.target.value)}
                        placeholder="Nome do familiar"
                      />
                    </div>
                    <div>
                      <Label htmlFor="familiar_data_nascimento">Data de Nascimento</Label>
                      <Input
                        id="familiar_data_nascimento"
                        type="date"
                        value={familiarForm.data_nascimento}
                        onChange={(e) => handleFamiliarInputChange('data_nascimento', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="familiar_parentesco">Parentesco *</Label>
                      <Input
                        id="familiar_parentesco"
                        value={familiarForm.parentesco}
                        onChange={(e) => handleFamiliarInputChange('parentesco', e.target.value)}
                        placeholder="Parentesco"
                      />
                    </div>
                    <div>
                      <Label htmlFor="familiar_escolaridade">Escolaridade</Label>
                      <Input
                        id="familiar_escolaridade"
                        value={familiarForm.escolaridade}
                        onChange={(e) => handleFamiliarInputChange('escolaridade', e.target.value)}
                        placeholder="Escolaridade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="familiar_ocupacao">Ocupação</Label>
                      <Input
                        id="familiar_ocupacao"
                        value={familiarForm.ocupacao}
                        onChange={(e) => handleFamiliarInputChange('ocupacao', e.target.value)}
                        placeholder="Ocupação"
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="familiar_deficiencia"
                        checked={familiarForm.deficiencia}
                        onChange={(e) => handleFamiliarInputChange('deficiencia', e.target.checked)}
                      />
                      <Label htmlFor="familiar_deficiencia">Possui deficiência?</Label>
                    </div>
                    {familiarForm.deficiencia && (
                      <div>
                        <Label htmlFor="familiar_tipo_deficiencia">Tipo de Deficiência</Label>
                        <Input
                          id="familiar_tipo_deficiencia"
                          value={familiarForm.tipo_deficiencia}
                          onChange={(e) => handleFamiliarInputChange('tipo_deficiencia', e.target.value)}
                          placeholder="Tipo de deficiência"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="familiar_necessita_fralda"
                        checked={familiarForm.necessita_fralda}
                        onChange={(e) => handleFamiliarInputChange('necessita_fralda', e.target.checked)}
                      />
                      <Label htmlFor="familiar_necessita_fralda">Necessita fralda?</Label>
                    </div>
                    {familiarForm.necessita_fralda && (
                      <div>
                        <Label htmlFor="familiar_tamanho_fralda">Tamanho da Fralda</Label>
                        <Input
                          id="familiar_tamanho_fralda"
                          value={familiarForm.tamanho_fralda}
                          onChange={(e) => handleFamiliarInputChange('tamanho_fralda', e.target.value)}
                          placeholder="Tamanho da fralda"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleAddFamiliar}>
                      {editingFamiliar ? "Atualizar Familiar" : "Adicionar Familiar"}
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
                        Cancelar Edição
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Lista de Familiares</h3>
                    {familiares.length === 0 && <p>Nenhum familiar adicionado.</p>}
                    {familiares.length > 0 && (
                      <ul className="space-y-2">
                        {familiares.map(familiar => (
                          <li key={familiar.id} className="flex justify-between items-center border p-2 rounded">
                            <div>
                              <p><strong>Nome:</strong> {familiar.nome}</p>
                              <p><strong>Parentesco:</strong> {familiar.parentesco}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditFamiliar(familiar)}>Editar</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRemoveFamiliar(familiar.id)}>Remover</Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endereco">
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Informações de endereço do assistido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rua">Rua</Label>
                    <Input
                      id="rua"
                      value={formData.rua}
                      onChange={(e) => handleInputChange('rua', e.target.value)}
                      placeholder="Rua"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => handleInputChange('numero', e.target.value)}
                      placeholder="Número"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange('bairro', e.target.value)}
                      placeholder="Bairro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      placeholder="Estado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="situacao_moradia">Situação da Moradia</Label>
                    <Select
                      value={formData.situacao_moradia}
                      onValueChange={(value) => handleInputChange('situacao_moradia', value)}
                    >
                      <SelectTrigger id="situacao_moradia">
                        <SelectValue placeholder="Selecione a situação da moradia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Própria">Própria</SelectItem>
                        <SelectItem value="Alugada">Alugada</SelectItem>
                        <SelectItem value="Cedida">Cedida</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="socioeconomico">
            <Card>
              <CardHeader>
                <CardTitle>Perfil Socioeconômico</CardTitle>
                <CardDescription>Informações socioeconômicas do assistido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="situacao_profissional">Situação Profissional</Label>
                    <Select
                      value={formData.situacao_profissional}
                      onValueChange={(value) => handleInputChange('situacao_profissional', value)}
                    >
                      <SelectTrigger id="situacao_profissional">
                        <SelectValue placeholder="Selecione a situação profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Empregado">Empregado</SelectItem>
                        <SelectItem value="Desempregado">Desempregado</SelectItem>
                        <SelectItem value="Aposentado">Aposentado</SelectItem>
                        <SelectItem value="Estudante">Estudante</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="renda_familiar">Renda Familiar</Label>
                    <Input
                      id="renda_familiar"
                      value={formData.renda_familiar}
                      onChange={(e) => handleInputChange('renda_familiar', e.target.value)}
                      placeholder="R$ 0,00"
                    />
                  </div>

                  <div>
                    <Label>Benefícios Recebidos</Label>
                    <div className="flex flex-col space-y-2">
                      {['Bolsa Família', 'Auxílio Emergencial', 'Benefício de Prestação Continuada', 'Outro'].map(beneficio => (
                        <label key={beneficio} className="inline-flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.beneficios_recebidos.includes(beneficio)}
                            onChange={(e) => handleBeneficioChange(beneficio, e.target.checked)}
                          />
                          <span>{beneficio}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Observações adicionais"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/assistidos')}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateAssistido} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>

        {/* Camera elements */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg space-y-4">
              <video ref={videoRef} autoPlay className="w-full max-w-md" />
              <div className="flex gap-2">
                <Button onClick={capturePhoto}>Capturar</Button>
                <Button variant="outline" onClick={stopCamera}>Cancelar</Button>
              </div>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </Layout>
  );
}
