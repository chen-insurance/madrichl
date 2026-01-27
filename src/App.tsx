import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTrafficSource } from "@/hooks/useTrafficSource";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Article from "./pages/Article";
import Contact from "./pages/Contact";
import ArticlesList from "./pages/admin/ArticlesList";
import ArticleEditor from "./pages/admin/ArticleEditor";
import Settings from "./pages/admin/Settings";
import FinancialTracks from "./pages/admin/FinancialTracks";

const queryClient = new QueryClient();

// Component to initialize traffic source tracking
const TrafficSourceTracker = ({ children }: { children: React.ReactNode }) => {
  useTrafficSource();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TrafficSourceTracker>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/news/:slug" element={<Article />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<ArticlesList />} />
              <Route path="/admin/articles/:id" element={<ArticleEditor />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/tracks" element={<FinancialTracks />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TrafficSourceTracker>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
