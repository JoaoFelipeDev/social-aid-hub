
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CadastroAssistido from "./pages/CadastroAssistido";
import Assistidos from "./pages/Assistidos";
import VisualizarAssistido from "./pages/VisualizarAssistido";
import EditarAssistido from "./pages/EditarAssistido";
import Acompanhamento from "./pages/Acompanhamento";
import Visitas from "./pages/Visitas";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cadastro" element={<CadastroAssistido />} />
          <Route path="/assistidos" element={<Assistidos />} />
          <Route path="/assistidos/:id" element={<VisualizarAssistido />} />
          <Route path="/assistidos/:id/editar" element={<EditarAssistido />} />
          <Route path="/editar-assistido/:id" element={<EditarAssistido />} />
          <Route path="/acompanhamento" element={<Acompanhamento />} />
          <Route path="/visitas" element={<Visitas />} />
          <Route path="/documentos" element={<div>Documentos</div>} />
          <Route path="/cestas" element={<div>Montagem de Cestas</div>} />
          <Route path="/relatorios" element={<div>Relatórios</div>} />
          <Route path="/admin" element={<div>Administração</div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
