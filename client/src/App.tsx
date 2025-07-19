import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import CreateRecipe from "@/pages/CreateRecipe";
import RecipeDetail from "@/pages/RecipeDetail";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  // Initialize Socket.IO connection
  useSocket();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Switch>
        <Route path="/" component={(props) => {
          const searchParams = new URLSearchParams(window.location.search);
          const searchQuery = searchParams.get('search') || undefined;
          return <Home searchQuery={searchQuery} />;
        }} />
        
        <Route path="/auth" component={Auth} />
        
        <Route path="/dashboard" component={() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )} />
        
        <Route path="/create" component={() => (
          <ProtectedRoute>
            <CreateRecipe />
          </ProtectedRoute>
        )} />
        
        <Route path="/recipe/:id" component={RecipeDetail} />
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
