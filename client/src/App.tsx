/* MotoTracker — auth gate: the private journal opens only after Google sign-in, while the existing app shell remains unchanged. */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthGate() {
  const { user, loading, configured, authError, signInWithGoogle } = useAuth();

  if (loading) {
    return <main className="auth-loading"><span className="auth-loading__spinner" /><p>Preparando seu diário...</p></main>;
  }

  if (!user) return <Login configured={configured} authError={authError} onSignIn={signInWithGoogle} />;
  return <Router />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster position="top-center" />
            <AuthGate />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
