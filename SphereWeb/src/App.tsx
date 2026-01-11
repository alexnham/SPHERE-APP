import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ViewModeProvider } from "@/contexts/ViewModeContext";
import { ThemeProvider } from "next-themes";
import DashboardLayout from "@/components/sphere/DashboardLayout";
import ScrollToTop from "@/components/ScrollToTop";
import Overview from "./pages/Overview";
import Spending from "./pages/Spending";
import Debts from "./pages/Debts";
import DebtDetail from "./pages/DebtDetail";
import Accounts from "./pages/Accounts";
import Investments from "./pages/Investments";
import Auth from "./pages/Auth";
import WeeklyReflection from "./pages/WeeklyReflection";
import Bills from "./pages/Bills";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ViewModeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
              <Route element={<DashboardLayout />}>
                  <Route path="/" element={<Navigate to="/overview" replace />} />
                  <Route path="/overview" element={<Overview />} />
                  <Route path="/spending" element={<Spending />} />
                  <Route path="/debts" element={<Debts />} />
                  <Route path="/debts/:id" element={<DebtDetail />} />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/investments" element={<Investments />} />
                  <Route path="/reflection" element={<WeeklyReflection />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ViewModeProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
