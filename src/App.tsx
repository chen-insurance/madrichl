import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTrafficSource } from "@/hooks/useTrafficSource";
import { useCustomScripts } from "@/hooks/useCustomScripts";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
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
import CTABlocks from "./pages/admin/CTABlocks";
import QuizBuilder from "./pages/admin/QuizBuilder";
import CalculatorsData from "./pages/admin/CalculatorsData";
import Glossary from "./pages/admin/Glossary";
import GlossaryIndex from "./pages/GlossaryIndex";
import GlossaryTerm from "./pages/GlossaryTerm";
import ExitIntentPopup from "./components/ExitIntentPopup";
import AccessibilityWidget from "./components/AccessibilityWidget";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

// Component to initialize traffic source tracking and custom scripts
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useTrafficSource();
  useCustomScripts();
  useThemeSettings();
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppInitializer>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/blog" element={<Blog />} />
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
              <Route path="/admin/cta-blocks" element={<CTABlocks />} />
              <Route path="/admin/quizzes" element={<QuizBuilder />} />
              <Route path="/admin/calculators" element={<CalculatorsData />} />
              <Route path="/admin/glossary" element={<Glossary />} />
              <Route path="/admin/media" element={<Media />} />
              <Route path="/admin/settings" element={<Settings />} />
              {/* Glossary pages */}
              <Route path="/glossary" element={<GlossaryIndex />} />
              <Route path="/glossary/:slug" element={<GlossaryTerm />} />
              {/* Static pages - MUST be before catch-all */}
              <Route path="/:slug" element={<StaticPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Exit Intent Popup - Global */}
            <ExitIntentPopup />
            {/* Accessibility Widget - Global */}
            <AccessibilityWidget />
          </BrowserRouter>
        </TooltipProvider>
      </AppInitializer>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
