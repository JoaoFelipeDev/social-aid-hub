
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
          <Route path="/auth" element={<Auth />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cadastro" 
            element={
              <ProtectedRoute>
                <CadastroAssistido />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assistidos" 
            element={
              <ProtectedRoute>
                <Assistidos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assistidos/:id" 
            element={
              <ProtectedRoute>
                <VisualizarAssistido />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assistidos/:id/editar" 
            element={
              <ProtectedRoute>
                <EditarAssistido />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editar-assistido/:id" 
            element={
              <ProtectedRoute>
                <EditarAssistido />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/acompanhamento" 
            element={
              <ProtectedRoute>
                <Acompanhamento />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/visitas" 
            element={
              <ProtectedRoute>
                <Visitas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/documentos" 
            element={
              <ProtectedRoute>
                <Documentos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cestas" 
            element={
              <ProtectedRoute>
                <Cestas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/relatorios" 
            element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
