import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Download, Trash2, Search, Plus, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Documento {
  id: string;
  assistido_id: string;
  tipo_documento: string;
  nome_arquivo: string;
  url_arquivo: string;
  created_at: string;
  assistidos?: {
    nome_completo: string;
  };
}

interface Assistido {
  id: string;
  nome_completo: string;
}

const tiposDocumento = [
  "RG",
  "CPF", 
  "Certidão de Nascimento",
  "Certidão de Casamento",
  "Comprovante de Residência",
  "Comprovante de Renda",
  "Cartão do SUS",
  "Título de Eleitor",
  "Carteira de Trabalho",
  "Declaração Escolar",
  "Laudo Médico",
  "Receita Médica",
  "Outros"
];

export default function Documentos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssistido, setSelectedAssistido] = useState<string>("all");
  const [selectedTipoDoc, setSelectedTipoDoc] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    assistido_id: "",
    tipo_documento: "",
    arquivo: null as File | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar documentos
  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ["documentos", selectedAssistido, selectedTipoDoc],
    queryFn: async () => {
      let query = supabase
        .from("documentos")
        .select(`
          *,
          assistidos:assistido_id (
            nome_completo
          )
        `)
        .order("created_at", { ascending: false });

      if (selectedAssistido && selectedAssistido !== "all") {
        query = query.eq("assistido_id", selectedAssistido);
      }

      if (selectedTipoDoc && selectedTipoDoc !== "all") {
        query = query.eq("tipo_documento", selectedTipoDoc);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Documento[];
    }
  });

  // Buscar assistidos para o select
  const { data: assistidos = [] } = useQuery({
    queryKey: ["assistidos-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistidos")
        .select("id, nome_completo")
        .eq("status", "Ativo")
        .order("nome_completo");
      
      if (error) throw error;
      return data as Assistido[];
    }
  });

  // Mutation para upload de documento
  const uploadDocumentoMutation = useMutation({
    mutationFn: async (data: { assistido_id: string; tipo_documento: string; arquivo: File }) => {
      const { assistido_id, tipo_documento, arquivo } = data;
      
      // Upload do arquivo para o storage
      const fileExt = arquivo.name.split('.').pop();
      const fileName = `${assistido_id}/${tipo_documento}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, arquivo);

      if (uploadError) throw uploadError;

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName);

      // Salvar informações do documento no banco
      const { error } = await supabase
        .from("documentos")
        .insert([{
          assistido_id,
          tipo_documento,
          nome_arquivo: arquivo.name,
          url_arquivo: publicUrl
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      setIsDialogOpen(false);
      setFormData({
        assistido_id: "",
        tipo_documento: "",
        arquivo: null
      });
      setUploadingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Documento enviado!",
        description: "O documento foi enviado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar documento",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar documento
  const deleteDocumentoMutation = useMutation({
    mutationFn: async (documento: Documento) => {
      // Extrair o caminho do arquivo da URL
      const urlParts = documento.url_arquivo.split('/');
      const filePath = urlParts.slice(-2).join('/'); // pega assistido_id/nome_arquivo
      
      // Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Deletar registro do banco
      const { error } = await supabase
        .from("documentos")
        .delete()
        .eq("id", documento.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
      toast({
        title: "Documento excluído!",
        description: "O documento foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir documento",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, arquivo: file }));
      setUploadingFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assistido_id || !formData.tipo_documento || !formData.arquivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos e selecione um arquivo.",
        variant: "destructive",
      });
      return;
    }
    uploadDocumentoMutation.mutate(formData);
  };

  const handleDownload = (documento: Documento) => {
    window.open(documento.url_arquivo, '_blank');
  };

  const handleDelete = (documento: Documento) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      deleteDocumentoMutation.mutate(documento);
    }
  };

  const documentosFiltrados = documentos.filter(doc =>
    doc.assistidos?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tipo_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.nome_arquivo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
            <p className="text-muted-foreground">Gerencie os documentos dos assistidos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Enviar Novo Documento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assistido_id">Assistido *</Label>
                    <Select 
                      value={formData.assistido_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, assistido_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o assistido" />
                      </SelectTrigger>
                      <SelectContent>
                        {assistidos.map((assistido) => (
                          <SelectItem key={assistido.id} value={assistido.id}>
                            {assistido.nome_completo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_documento">Tipo de Documento *</Label>
                    <Select 
                      value={formData.tipo_documento} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_documento: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDocumento.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arquivo">Arquivo *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="arquivo"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Selecionar Arquivo
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          PDF, JPG, PNG, DOC até 10MB
                        </p>
                      </div>
                    </div>
                    {uploadingFile && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">Arquivo selecionado:</p>
                        <p className="text-sm text-muted-foreground">{uploadingFile.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploadDocumentoMutation.isPending}>
                    {uploadDocumentoMutation.isPending ? "Enviando..." : "Enviar Documento"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por assistido, tipo ou nome do arquivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedAssistido} onValueChange={setSelectedAssistido}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Filtrar por assistido" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os assistidos</SelectItem>
              {assistidos.map((assistido) => (
                <SelectItem key={assistido.id} value={assistido.id}>
                  {assistido.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedTipoDoc} onValueChange={setSelectedTipoDoc}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {tiposDocumento.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Documentos */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando documentos...</p>
          </div>
        ) : documentosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || (selectedAssistido !== "all") || (selectedTipoDoc !== "all")
                  ? "Nenhum documento corresponde aos filtros aplicados."
                  : "Comece enviando o primeiro documento."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documentosFiltrados.map((documento) => (
              <Card key={documento.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <File className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground truncate">
                          {documento.nome_arquivo}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {documento.assistidos?.nome_completo}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">
                            {documento.tipo_documento}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Enviado em {format(new Date(documento.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(documento)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(documento)}
                        disabled={deleteDocumentoMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}