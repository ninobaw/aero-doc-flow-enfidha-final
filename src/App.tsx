import React from 'react'; // Added this line
import 'react/jsx-runtime'; // Ensure the module is explicitly imported
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Documents from "./pages/Documents";
import QualiteDoc from "./pages/QualiteDoc";
import FormulairesDoc from "./pages/FormulairesDoc";
import Correspondances from "./pages/Correspondances";
import ProcesVerbaux from "./pages/ProcesVerbaux";
import Users from "./pages/Users";
import Actions from "./pages/Actions";
import QRCodes from "./pages/QRCodes";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Templates from "./pages/Templates"; // Import the new Templates page
import AuditLogs from "./pages/AuditLogs"; // Import the new AuditLogs page
import { TestAuthComponent } from "@/components/TestAuthComponent"; // Import the new test component

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        {/* Test component for AuthContext */}
        <TestAuthComponent /> 
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute requiredPermission="view_documents">
                <Documents />
              </ProtectedRoute>
            } />
            <Route path="/documents/qualite" element={
              <ProtectedRoute requiredPermission="view_documents">
                <QualiteDoc />
              </ProtectedRoute>
            } />
            <Route path="/documents/formulaires" element={
              <ProtectedRoute requiredPermission="manage_forms">
                <FormulairesDoc />
              </ProtectedRoute>
            } />
            <Route path="/documents/templates" element={ // New route for Templates
              <ProtectedRoute requiredPermission="manage_documents">
                <Templates />
              </ProtectedRoute>
            } />
            <Route path="/correspondances" element={
              <ProtectedRoute requiredPermission="view_correspondences"> {/* Changed permission */}
                <Correspondances />
              </ProtectedRoute>
            } />
            <Route path="/proces-verbaux" element={
              <ProtectedRoute requiredPermission="view_proces_verbaux"> {/* Changed permission */}
                <ProcesVerbaux />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredPermission="manage_users">
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/actions" element={
              <ProtectedRoute requiredPermission="view_actions"> {/* Changed permission */}
                <Actions />
              </ProtectedRoute>
            } />
            <Route path="/qr-codes" element={
              <ProtectedRoute requiredPermission="view_qr_codes"> {/* Changed permission */}
                <QRCodes />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredPermission="view_reports">
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/audit-logs" element={/* New route for Audit Logs */
              <ProtectedRoute requiredPermission="view_audit_logs"> {/* Changed permission */}
                <AuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredPermission="manage_settings">
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;