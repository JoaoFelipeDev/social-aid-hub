import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Download, FileText, Users, Home, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface ReportData {
  assistidos: any[];
  visitas: any[];
  cestas: any[];
  documentos: any[];
}

export default function Relatorios() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState('geral');
  const [reportData, setReportData] = useState<ReportData>({
    assistidos: [],
    visitas: [],
    cestas: [],
    documentos: []
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [dateRange, searchTerm]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Carregar assistidos
      let assistidosQuery = supabase
        .from('assistidos')
        .select('*');

      if (searchTerm) {
        assistidosQuery = assistidosQuery.ilike('nome_completo', `%${searchTerm}%`);
      }

      if (dateRange.from && dateRange.to) {
        assistidosQuery = assistidosQuery
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data: assistidos, error: assistidosError } = await assistidosQuery;

      // Carregar visitas domiciliares
      let visitasQuery = supabase
        .from('visitas_domiciliares')
        .select(`
          *,
          assistidos(nome_completo)
        `);

      if (dateRange.from && dateRange.to) {
        visitasQuery = visitasQuery
          .gte('data_visita', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('data_visita', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data: visitas, error: visitasError } = await visitasQuery;

      // Carregar retiradas de cestas
      let cestasQuery = supabase
        .from('retiradas_cesta')
        .select(`
          *,
          assistidos(nome_completo)
        `);

      if (dateRange.from && dateRange.to) {
        cestasQuery = cestasQuery
          .gte('data_retirada', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('data_retirada', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data: cestas, error: cestasError } = await cestasQuery;

      // Carregar documentos
      let documentosQuery = supabase
        .from('documentos')
        .select(`
          *,
          assistidos(nome_completo)
        `);

      if (dateRange.from && dateRange.to) {
        documentosQuery = documentosQuery
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data: documentos, error: documentosError } = await documentosQuery;

      if (assistidosError || visitasError || cestasError || documentosError) {
        throw new Error('Erro ao carregar dados dos relatórios');
      }

      setReportData({
        assistidos: assistidos || [],
        visitas: visitas || [],
        cestas: cestas || [],
        documentos: documentos || []
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar relatórios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = (type: string) => {
    const doc = new jsPDF();
    
    // Configurar fonte para suportar caracteres especiais
    doc.setFont('helvetica');
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Sistema de Assistência Social', 20, 20);
    doc.setFontSize(16);
    doc.text(`Relatório de ${type === 'assistidos' ? 'Assistidos' : 
                            type === 'visitas' ? 'Visitas Domiciliares' : 
                            type === 'cestas' ? 'Retiradas de Cestas' : 
                            type === 'documentos' ? 'Documentos' : 'Geral'}`, 20, 30);
    
    // Período
    if (dateRange.from && dateRange.to) {
      doc.setFontSize(12);
      doc.text(`Período: ${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} a ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`, 20, 40);
    }

    let yPosition = 50;

    switch (type) {
      case 'assistidos':
        const assistidosData = reportData.assistidos.map(assistido => [
          assistido.nome_completo,
          assistido.cpf,
          assistido.telefone || 'N/A',
          assistido.status,
          format(new Date(assistido.created_at), 'dd/MM/yyyy', { locale: ptBR })
        ]);

        autoTable(doc, {
          head: [['Nome', 'CPF', 'Telefone', 'Status', 'Cadastrado em']],
          body: assistidosData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        break;

      case 'visitas':
        const visitasData = reportData.visitas.map(visita => [
          (visita as any).assistidos?.nome_completo || 'N/A',
          visita.nome_visitante,
          format(new Date(visita.data_visita), 'dd/MM/yyyy', { locale: ptBR }),
          visita.recebido_por || 'N/A',
          visita.relatorio ? 'Sim' : 'Não'
        ]);

        autoTable(doc, {
          head: [['Assistido', 'Visitante', 'Data', 'Recebido por', 'Tem Relatório']],
          body: visitasData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        break;

      case 'cestas':
        const cestasData = reportData.cestas.map(cesta => [
          (cesta as any).assistidos?.nome_completo || 'N/A',
          format(new Date(cesta.data_retirada), 'dd/MM/yyyy', { locale: ptBR }),
          cesta.observacao || 'N/A'
        ]);

        autoTable(doc, {
          head: [['Assistido', 'Data Retirada', 'Observação']],
          body: cestasData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        break;

      case 'documentos':
        const documentosData = reportData.documentos.map(doc => [
          (doc as any).assistidos?.nome_completo || 'N/A',
          doc.tipo_documento,
          doc.nome_arquivo,
          format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ptBR })
        ]);

        autoTable(doc, {
          head: [['Assistido', 'Tipo', 'Arquivo', 'Enviado em']],
          body: documentosData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] }
        });
        break;

      case 'geral':
        // Estatísticas gerais
        doc.setFontSize(14);
        doc.text('Resumo Geral', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.text(`Total de Assistidos: ${reportData.assistidos.length}`, 20, yPosition);
        doc.text(`Total de Visitas: ${reportData.visitas.length}`, 20, yPosition + 10);
        doc.text(`Total de Retiradas de Cestas: ${reportData.cestas.length}`, 20, yPosition + 20);
        doc.text(`Total de Documentos: ${reportData.documentos.length}`, 20, yPosition + 30);
        break;
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 
               doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
    }

    // Salvar
    doc.save(`relatorio-${type}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast({
      title: "Sucesso",
      description: "Relatório exportado com sucesso!"
    });
  };

  const stats = {
    assistidos: reportData.assistidos.length,
    visitas: reportData.visitas.length,
    cestas: reportData.cestas.length,
    documentos: reportData.documentos.length
  };

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
            <p className="text-muted-foreground">
              Gere relatórios detalhados e estatísticas do sistema
            </p>
          </div>
          <Button onClick={() => exportToPDF('geral')} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Geral
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Configure os filtros para gerar relatórios personalizados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        "Selecione o período"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={2}
                      locale={ptBR}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">Buscar por nome</Label>
                <Input
                  id="search"
                  placeholder="Digite o nome do assistido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Relatório Geral</SelectItem>
                    <SelectItem value="assistidos">Assistidos</SelectItem>
                    <SelectItem value="visitas">Visitas Domiciliares</SelectItem>
                    <SelectItem value="cestas">Retiradas de Cestas</SelectItem>
                    <SelectItem value="documentos">Documentos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assistidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assistidos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas Realizadas</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.visitas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cestas Entregues</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cestas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documentos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Relatórios Detalhados */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Detalhados</CardTitle>
            <CardDescription>
              Visualize e exporte relatórios específicos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={reportType} onValueChange={setReportType}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="assistidos">Assistidos</TabsTrigger>
                <TabsTrigger value="visitas">Visitas</TabsTrigger>
                <TabsTrigger value="cestas">Cestas</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Resumo Geral</h3>
                  <Button onClick={() => exportToPDF('geral')} size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Estatísticas do Período</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Assistidos cadastrados:</span>
                        <Badge variant="secondary">{stats.assistidos}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Visitas realizadas:</span>
                        <Badge variant="secondary">{stats.visitas}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Cestas entregues:</span>
                        <Badge variant="secondary">{stats.cestas}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Documentos enviados:</span>
                        <Badge variant="secondary">{stats.documentos}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assistidos" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Relatório de Assistidos</h3>
                  <Button onClick={() => exportToPDF('assistidos')} size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastrado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.assistidos.map((assistido) => (
                      <TableRow key={assistido.id}>
                        <TableCell className="font-medium">{assistido.nome_completo}</TableCell>
                        <TableCell>{assistido.cpf}</TableCell>
                        <TableCell>{assistido.telefone || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={assistido.status === 'Ativo' ? 'default' : 'secondary'}>
                            {assistido.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(assistido.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="visitas" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Relatório de Visitas Domiciliares</h3>
                  <Button onClick={() => exportToPDF('visitas')} size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assistido</TableHead>
                      <TableHead>Visitante</TableHead>
                      <TableHead>Data da Visita</TableHead>
                      <TableHead>Recebido por</TableHead>
                      <TableHead>Relatório</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.visitas.map((visita) => (
                      <TableRow key={visita.id}>
                        <TableCell className="font-medium">
                          {(visita as any).assistidos?.nome_completo || 'N/A'}
                        </TableCell>
                        <TableCell>{visita.nome_visitante}</TableCell>
                        <TableCell>{format(new Date(visita.data_visita), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>{visita.recebido_por || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={visita.relatorio ? 'default' : 'secondary'}>
                            {visita.relatorio ? 'Sim' : 'Não'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="cestas" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Relatório de Retiradas de Cestas</h3>
                  <Button onClick={() => exportToPDF('cestas')} size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assistido</TableHead>
                      <TableHead>Data da Retirada</TableHead>
                      <TableHead>Observação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.cestas.map((cesta) => (
                      <TableRow key={cesta.id}>
                        <TableCell className="font-medium">
                          {(cesta as any).assistidos?.nome_completo || 'N/A'}
                        </TableCell>
                        <TableCell>{format(new Date(cesta.data_retirada), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                        <TableCell>{cesta.observacao || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Relatório de Documentos</h3>
                  <Button onClick={() => exportToPDF('documentos')} size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assistido</TableHead>
                      <TableHead>Tipo de Documento</TableHead>
                      <TableHead>Nome do Arquivo</TableHead>
                      <TableHead>Enviado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.documentos.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {(doc as any).assistidos?.nome_completo || 'N/A'}
                        </TableCell>
                        <TableCell>{doc.tipo_documento}</TableCell>
                        <TableCell>{doc.nome_arquivo}</TableCell>
                        <TableCell>{format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ptBR })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}