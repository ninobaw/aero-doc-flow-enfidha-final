import React from 'react';
import 'react/jsx-runtime';
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
import FormulairesDoc from "./pages/FormulairesDoc";
import Correspondances from "./pages/Correspondances";
import ProcesVerbaux from "./pages/ProcesVerbaux";
import Users from "./pages/Users";
import Actions from "./pages/Actions";
import QRCodes from "./pages/QRCodes";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import Profile from "./pages/Profile";
import Templates from "./pages/Templates";
import AuditLogs from "./pages/AuditLogs";
import OnlyOfficeEditorPage from "./pages/OnlyOfficeEditorPage"; // Import the new page

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
              <ProtectedRoute> {/* Removed requiredPermission */}
                <Documents />
              </ProtectedRoute>
            } />
            <Route path="/documents/formulaires" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <FormulairesDoc />
              </ProtectedRoute>
            } />
            <Route path="/documents/templates" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <Templates />
              </ProtectedRoute>
            } />
            <Route path="/documents/edit-onlyoffice/:documentId" element={ {/* New route for OnlyOffice editor */}
              <ProtectedRoute> {/* Removed requiredPermission */}
                <OnlyOfficeEditorPage />
              </ProtectedRoute>
            } />
            <Route path="/correspondances" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <Correspondances />
              </ProtectedRoute>
            } />
            <Route path="/proces-verbaux" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <ProcesVerbaux />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/actions" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <Actions />
              </ProtectedRoute>
            } />
            <Route path="/qr-codes" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <QRCodes />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <AuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute> {/* Removed requiredPermission */}
                <SettingsPage />
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