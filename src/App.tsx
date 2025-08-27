import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CadastroAssistido from "./pages/CadastroAssistido";

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
          <Route path="/assistidos" element={<div>Lista de Assistidos</div>} />
          <Route path="/acompanhamento" element={<div>Acompanhamento</div>} />
          <Route path="/visitas" element={<div>Visitas Domiciliares</div>} />
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
