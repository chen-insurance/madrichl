import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreadcrumbSchema from "@/components/article/BreadcrumbSchema";
import ArticleCard from "@/components/home/ArticleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";
import { useState, useMemo } from "react";

const ARTICLES_PER_PAGE = 12;

// Map direct paths to category slugs
const PATH_TO_SLUG_MAP: Record<string, string> = {
  "/health-insurance": "health-insurance",
  "/life-insurance": "life-insurance",
  "/car-insurance": "car-insurance",
  "/property-insurance": "property-insurance",
  "/pension": "pension",
  "/employer-insurance": "employer-insurance",
};

const CategoryArchive = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Determine the category slug - either from URL param or from direct path mapping
  const slug = paramSlug || PATH_TO_SLUG_MAP[location.pathname];

  // Fetch category details
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Fetch all articles for this category (we'll filter client-side for search)
  const { data: allArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["category-all-articles", category?.id],
    queryFn: async () => {
      // First try to get articles via the junction table
      const { data: junctionArticles, error: junctionError } = await supabase
        .from("article_categories")
        .select(`
          article_id,
          articles!inner (
            id, title, slug, excerpt, featured_image, published_at, category, is_published
          )
        `)
        .eq("category_id", category?.id);

      if (!junctionError && junctionArticles && junctionArticles.length > 0) {
        // Filter and transform junction table results
        return junctionArticles
          .map((item) => item.articles)
          .filter((article: any) => 
            article.is_published && 
            new Date(article.published_at) <= new Date()
          )
          .sort((a: any, b: any) => 
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
      }

      // Fallback: query by legacy category name field
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image, published_at, category")
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .eq("category", category?.name)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!category?.id,
  });

  // Filter articles based on search query
  const filteredArticles = useMemo(() => {
    if (!allArticles) return [];
    if (!searchQuery.trim()) return allArticles;
    
    const query = searchQuery.toLowerCase();
    return allArticles.filter(
      (article: any) =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(query))
    );
  }, [allArticles, searchQuery]);

  // Paginate filtered results
  const paginatedArticles = useMemo(() => {
    const from = (currentPage - 1) * ARTICLES_PER_PAGE;
    const to = from + ARTICLES_PER_PAGE;
    return filteredArticles.slice(from, to);
  }, [filteredArticles, currentPage]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            קטגוריה לא נמצאה
          </h1>
          <p className="text-muted-foreground mb-8">
            הקטגוריה שחיפשת אינה קיימת במערכת.
          </p>
          <Link to="/">
            <Button>חזרה לדף הבית</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{category.name} | המדריך לצרכן</title>
        <meta
          name="description"
          content={category.description || `כל המאמרים בקטגוריית ${category.name} - המדריך לצרכן`}
        />
        <link rel="canonical" href={`https://the-guide.co.il/category/${slug}`} />
        <meta property="og:title" content={`${category.name} | המדריך לצרכן`} />
        <meta property="og:description" content={category.description || `כל המאמרים בקטגוריית ${category.name} - המדריך לצרכן`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://the-guide.co.il/category/${slug}`} />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${category.name} | המדריך לצרכן`} />
        <meta name="twitter:description" content={category.description || `כל המאמרים בקטגוריית ${category.name}`} />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Category Header with SEO Content */}
        <div className="mb-10">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-accent transition-colors">
              דף הבית
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{category.name}</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-3xl mb-6">
              {category.description}
            </p>
          )}

          {/* Search Bar */}
          <div className="relative max-w-xl mb-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`חיפוש ב${category.name}...`}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pr-12 py-5 rounded-full border-2 border-border focus:border-accent"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredArticles.length} מאמרים
            {searchQuery && ` עבור "${searchQuery}"`}
          </p>
        </div>

        {/* Articles Grid */}
        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : paginatedArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginatedArticles.map((article: any) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ""}
                  slug={article.slug}
                  featured_image={article.featured_image || undefined}
                  published_at={article.published_at || new Date().toISOString()}
                  category={article.category || category.name}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {getPaginationNumbers().map((page, index) => (
                  <div key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page as number)}
                      >
                        {page}
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-6">
              {searchQuery
                ? `לא נמצאו מאמרים התואמים לחיפוש "${searchQuery}"`
                : "אין עדיין מאמרים בקטגוריה זו."}
            </p>
            {searchQuery ? (
              <Button onClick={() => setSearchQuery("")} variant="outline">
                נקה חיפוש
              </Button>
            ) : (
              <Link to="/">
                <Button>חזרה לדף הבית</Button>
              </Link>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryArchive;
