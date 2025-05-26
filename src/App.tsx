
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Documents from "./pages/Documents";
import Users from "./pages/Users";
import Actions from "./pages/Actions";
import QRCodes from "./pages/QRCodes";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/formulaires" element={<Documents />} />
          <Route path="/documents/correspondances" element={<Documents />} />
          <Route path="/documents/proces-verbaux" element={<Documents />} />
          <Route path="/users" element={<Users />} />
          <Route path="/actions" element={<Actions />} />
          <Route path="/qr-codes" element={<QRCodes />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
