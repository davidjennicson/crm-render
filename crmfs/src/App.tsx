import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Index from "./pages/Index.tsx";
import Contacts from "./pages/Contacts";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";
import Teams from "./pages/Teams";
import Workflows from "./pages/Workflows.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import NotFound from "./pages/Notfound.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Analytics from "./pages/Analytics.tsx";
import Companies from "./pages/Companies";
import Messages from "./pages/Messages";

const queryClient = new QueryClient();

/** Wraps a route so it redirects to /login when unauthenticated. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // If authenticated but setup not completed, redirect to onboarding 
  // unless we are already on the onboarding page
  if (user && !user.setupCompleted && window.location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

/** Redirects already-logged-in users away from auth pages. */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    if (user && !user.setupCompleted) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Authentication Routes */}
    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
    <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

    {/* Main Protected Routes */}
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
    <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
    <Route path="/deals" element={<ProtectedRoute><Deals /></ProtectedRoute>} />
    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
    <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
    <Route path="/workflows" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
