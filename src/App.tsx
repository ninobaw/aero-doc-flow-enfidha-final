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
import { SyncfusionDocumentEditor } from './components/documents/SyncfusionDocumentEditor'; // Import the new Syncfusion editor

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
              <ProtectedRoute requiredPermission="view_documents">
                <Documents />
              </ProtectedRoute>
            } />
            <Route path="/documents/formulaires" element={
              <ProtectedRoute requiredPermission="manage_forms">
                <FormulairesDoc />
              </ProtectedRoute>
            } />
            <Route path="/documents/templates" element={
              <ProtectedRoute requiredPermission="manage_documents">
                <Templates />
              </ProtectedRoute>
            } />
            <Route path="/documents/:documentId/edit" element={
              <ProtectedRoute requiredPermission="update_documents"> {/* Assuming edit permission is needed */}
                <SyncfusionDocumentEditor />
              </ProtectedRoute>
            } />
            <Route path="/correspondances" element={
              <ProtectedRoute requiredPermission="view_correspondences">
                <Correspondances />
              </ProtectedRoute>
            } />
            <Route path="/proces-verbaux" element={
              <ProtectedRoute requiredPermission="view_proces_verbaux">
                <ProcesVerbaux />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute requiredPermission="manage_users">
                <Users />
              </ProtectedRoute>
            } />
            <Route path="/actions" element={
              <ProtectedRoute requiredPermission="view_actions">
                <Actions />
              </ProtectedRoute>
            } />
            <Route path="/qr-codes" element={
              <ProtectedRoute requiredPermission="view_qr_codes">
                <QRCodes />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute requiredPermission="view_reports">
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <ProtectedRoute requiredPermission="view_audit_logs">
                <AuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requiredPermission="manage_settings">
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