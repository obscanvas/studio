import React, { useEffect } from "react";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { RefreshCw } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Config from "./pages/Config";
import Docs from "./pages/Docs";
import Login from "./pages/Login";
import Projects from "./pages/Projects";

const useCleanHashLocation = () => {
  const [location, setLocation] = useHashLocation();
  // Query parametrelerini (e.g. ?id=...) route eslesmesinden ayiriyoruz.
  const [path] = location.split("?");
  return [path, setLocation] as [string, typeof setLocation];
};

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, setLocation, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

function ProtectedConfig() {
  return (
    <RequireAuth>
      <Config />
    </RequireAuth>
  );
}

function ProtectedProjects() {
  return (
    <RequireAuth>
      <Projects />
    </RequireAuth>
  );
}

function Router() {
  return (
    <WouterRouter hook={useCleanHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/config" component={ProtectedConfig} />
        <Route path="/projects" component={Projects} />
        <Route path="/docs" component={Docs} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

