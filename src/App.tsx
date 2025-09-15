
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CadastroAssistido from "./pages/CadastroAssistido";
import Assistidos from "./pages/Assistidos";
import VisualizarAssistido from "./pages/VisualizarAssistido";
import EditarAssistido from "./pages/EditarAssistido";
import Acompanhamento from "./pages/Acompanhamento";
import Visitas from "./pages/Visitas";
import Documentos from "./pages/Documentos";
import Cestas from "./pages/Cestas";
import Relatorios from "./pages/Relatorios";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={<Index />} 
          />
          <Route 
            path="/cadastro" 
            element={<CadastroAssistido />} 
          />
          <Route 
            path="/assistidos" 
            element={<Assistidos />} 
          />
          <Route 
            path="/assistidos/:id" 
            element={<VisualizarAssistido />} 
          />
          <Route 
            path="/assistidos/:id/editar" 
            element={<EditarAssistido />} 
          />
          <Route 
            path="/editar-assistido/:id" 
            element={<EditarAssistido />} 
          />
          <Route 
            path="/acompanhamento" 
            element={<Acompanhamento />} 
          />
          <Route 
            path="/visitas" 
            element={<Visitas />} 
          />
          <Route 
            path="/documentos" 
            element={<Documentos />} 
          />
          <Route 
            path="/cestas" 
            element={<Cestas />} 
          />
          <Route 
            path="/relatorios" 
            element={<Relatorios />} 
          />
          <Route 
            path="/admin" 
            element={<Admin />} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
