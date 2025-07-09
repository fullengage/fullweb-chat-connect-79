import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Landing from "@/pages/Landing";
import Conversations from "@/pages/Conversations";
import Analytics from "@/pages/Analytics";
import ChatArea from "@/pages/ChatArea";
import Email from "@/pages/Email";
import Contacts from "@/pages/Contacts";
import Agents from "@/pages/Agents";
import Teams from "@/pages/Teams";
import AgentBots from "@/pages/AgentBots";
import Accounts from "@/pages/Accounts";
import "./App.css";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
      />
      <Route 
        path="/" 
        element={<Landing />}
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/conversations" 
        element={
          <ProtectedRoute>
            <Conversations />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <ChatArea />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/email" 
        element={
          <ProtectedRoute>
            <Email />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contacts" 
        element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/agents" 
        element={
          <ProtectedRoute>
            <Agents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/teams" 
        element={
          <ProtectedRoute>
            <Teams />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/agent-bots" 
        element={
          <ProtectedRoute>
            <AgentBots />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/accounts" 
        element={
          <ProtectedRoute>
            <Accounts />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
