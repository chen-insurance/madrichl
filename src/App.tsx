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
import Preview from "./pages/Preview";
import CategoryArchive from "./pages/CategoryArchive";
import StaticPage from "./pages/StaticPage";
import ArticlesList from "./pages/admin/ArticlesList";
import ArticleEditor from "./pages/admin/ArticleEditor";
import Settings from "./pages/admin/Settings";
import FinancialTracks from "./pages/admin/FinancialTracks";
import Categories from "./pages/admin/Categories";
import Dashboard from "./pages/admin/Dashboard";
import Media from "./pages/admin/Media";
import HomepageSettings from "./pages/admin/HomepageSettings";
import Leads from "./pages/admin/Leads";
import Menus from "./pages/admin/Menus";
import PagesList from "./pages/admin/PagesList";
import PageEditor from "./pages/admin/PageEditor";
import Authors from "./pages/admin/Authors";
import Redirects from "./pages/admin/Redirects";

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
              <Route path="/preview" element={<Preview />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/category/:slug" element={<CategoryArchive />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<ArticlesList />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/articles/:id" element={<ArticleEditor />} />
              <Route path="/admin/categories" element={<Categories />} />
              <Route path="/admin/homepage" element={<HomepageSettings />} />
              <Route path="/admin/tracks" element={<FinancialTracks />} />
              <Route path="/admin/leads" element={<Leads />} />
              <Route path="/admin/menus" element={<Menus />} />
              <Route path="/admin/pages" element={<PagesList />} />
              <Route path="/admin/pages/:id" element={<PageEditor />} />
              <Route path="/admin/authors" element={<Authors />} />
              <Route path="/admin/redirects" element={<Redirects />} />
              <Route path="/admin/media" element={<Media />} />
              <Route path="/admin/settings" element={<Settings />} />
              {/* Static pages - MUST be before catch-all */}
              <Route path="/:slug" element={<StaticPage />} />
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
