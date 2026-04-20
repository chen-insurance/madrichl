import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useTrafficSource } from "@/hooks/useTrafficSource";
import { useCustomScripts } from "@/hooks/useCustomScripts";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/common/ErrorBoundary";
import BackToTop from "./components/common/BackToTop";

// Eagerly load the landing/index page for best FCP
import Index from "./pages/Index";

// Lazy load all other pages
const Blog = lazy(() => import("./pages/Blog"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Article = lazy(() => import("./pages/Article"));
const Contact = lazy(() => import("./pages/Contact"));
const Preview = lazy(() => import("./pages/Preview"));
const CategoryArchive = lazy(() => import("./pages/CategoryArchive"));
const StaticPage = lazy(() => import("./pages/StaticPage"));
const GlossaryIndex = lazy(() => import("./pages/GlossaryIndex"));
const GlossaryTerm = lazy(() => import("./pages/GlossaryTerm"));
const Calculators = lazy(() => import("./pages/Calculators"));

// Lazy load admin pages
const ArticlesList = lazy(() => import("./pages/admin/ArticlesList"));
const ArticleEditor = lazy(() => import("./pages/admin/ArticleEditor"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const FinancialTracks = lazy(() => import("./pages/admin/FinancialTracks"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Media = lazy(() => import("./pages/admin/Media"));
const HomepageSettings = lazy(() => import("./pages/admin/HomepageSettings"));
const Leads = lazy(() => import("./pages/admin/Leads"));
const Menus = lazy(() => import("./pages/admin/Menus"));
const PagesList = lazy(() => import("./pages/admin/PagesList"));
const PageEditor = lazy(() => import("./pages/admin/PageEditor"));
const Authors = lazy(() => import("./pages/admin/Authors"));
const Redirects = lazy(() => import("./pages/admin/Redirects"));
const CTABlocks = lazy(() => import("./pages/admin/CTABlocks"));
const QuizBuilder = lazy(() => import("./pages/admin/QuizBuilder"));
const CalculatorsData = lazy(() => import("./pages/admin/CalculatorsData"));
const Glossary = lazy(() => import("./pages/admin/Glossary"));

// Lazy load heavy global components
const ExitIntentPopup = lazy(() => import("./components/ExitIntentPopup"));
const AccessibilityWidget = lazy(() => import("./components/AccessibilityWidget"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
      refetchOnWindowFocus: false,
    },
  },
});

// Component to initialize traffic source tracking and custom scripts
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  useTrafficSource();
  useCustomScripts();
  useThemeSettings();
  return <>{children}</>;
};

// Minimal loading fallback
const PageFallback = () => (
  <div className="min-h-screen bg-background" />
);

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppInitializer>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/news/:slug" element={<Article />} />
                <Route path="/preview" element={<Preview />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/category/:slug" element={<CategoryArchive />} />
                {/* Insurance category shortcuts */}
                <Route path="/health-insurance" element={<CategoryArchive />} />
                <Route path="/life-insurance" element={<CategoryArchive />} />
                <Route path="/car-insurance" element={<CategoryArchive />} />
                <Route path="/property-insurance" element={<CategoryArchive />} />
                <Route path="/pension" element={<CategoryArchive />} />
                <Route path="/employer-insurance" element={<CategoryArchive />} />
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
                {/* Calculators */}
                <Route path="/calculators" element={<Calculators />} />
                {/* Glossary pages */}
                <Route path="/glossary" element={<GlossaryIndex />} />
                <Route path="/glossary/:slug" element={<GlossaryTerm />} />
                {/* Static pages - MUST be before catch-all */}
                <Route path="/:slug" element={<StaticPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            {/* Lazy-loaded global components */}
            <Suspense fallback={null}>
              <ExitIntentPopup />
              <AccessibilityWidget />
            </Suspense>
            <BackToTop />
          </BrowserRouter>
        </TooltipProvider>
      </AppInitializer>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
