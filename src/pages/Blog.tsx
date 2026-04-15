import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleCard from "@/components/home/ArticleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";

const ARTICLES_PER_PAGE = 12;

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search — wait 300ms after user stops typing before querying DB
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Server-side pagination + search — only fetches the current page from DB
  const { data, isLoading, isError } = useQuery({
    queryKey: ["articles-paged", currentPage, debouncedSearch],
    queryFn: async () => {
      const from = (currentPage - 1) * ARTICLES_PER_PAGE;
      const to = from + ARTICLES_PER_PAGE - 1;

      let query = supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image, published_at, category", { count: "exact" })
        .eq("is_published", true)
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
        .range(from, to);

      if (debouncedSearch.trim()) {
        query = query.or(
          `title.ilike.%${debouncedSearch.trim()}%,excerpt.ilike.%${debouncedSearch.trim()}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return { articles: data || [], total: count || 0 };
    },
  });

  const articles = data?.articles || [];
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">שגיאה בטעינת הכתבות</h1>
          <p className="text-muted-foreground mb-6">
            לא הצלחנו לטעון את הכתבות. אנא נסה שוב.
          </p>
          <Button onClick={() => window.location.reload()}>נסה שוב</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>כל הכתבות | המדריך לצרכן</title>
        <meta
          name="description"
          content="כל הכתבות והמדריכים בנושאי ביטוח, פנסיה ופיננסים - המדריך לצרכן"
        />
        <link rel="canonical" href="https://the-guide.co.il/blog" />
        <meta property="og:title" content="כל הכתבות | המדריך לצרכן" />
        <meta property="og:description" content="כל הכתבות והמדריכים בנושאי ביטוח, פנסיה ופיננסים - המדריך לצרכן" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-guide.co.il/blog" />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:image" content="https://the-guide.co.il/og-default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="כל הכתבות | המדריך לצרכן" />
        <meta name="twitter:description" content="כל הכתבות והמדריכים בנושאי ביטוח, פנסיה ופיננסים - המדריך לצרכן" />
        <meta name="twitter:image" content="https://the-guide.co.il/og-default.png" />
        {allArticles && allArticles.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "כל הכתבות - המדריך לצרכן",
              url: "https://the-guide.co.il/blog",
              description: "כל הכתבות והמדריכים בנושאי ביטוח, פנסיה ופיננסים",
              inLanguage: "he",
              mainEntity: {
                "@type": "ItemList",
                itemListElement: allArticles.slice(0, 50).map((a, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: `https://the-guide.co.il/news/${a.slug}`,
                  name: a.title,
                })),
              },
            })}
          </script>
        )}
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            כל הכתבות
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            מאמרים, מדריכים וחדשות עדכניות בנושאי ביטוח, פנסיה ופיננסים
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Input
              type="text"
              placeholder="חפש כתבה או נושא..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pr-12 py-6 text-lg rounded-full border-2 border-border focus:border-accent bg-background"
            />
          </div>

          {!isLoading && totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              {totalCount} כתבות נמצאו
              {debouncedSearch && ` עבור "${debouncedSearch}"`}
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ""}
                  slug={article.slug}
                  featured_image={article.featured_image || undefined}
                  published_at={article.published_at || new Date().toISOString()}
                  category={article.category || undefined}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2" aria-label="ניווט דפים">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="עמוד קודם"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>

                {getPaginationNumbers().map((page, index) => (
                  <div key={index}>
                    {page === "..." ? (
                      <span className="px-3 py-2 text-muted-foreground" aria-hidden="true">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page as number)}
                        aria-label={`עמוד ${page}`}
                        aria-current={currentPage === page ? "page" : undefined}
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
                  aria-label="עמוד הבא"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-6">
              {debouncedSearch
                ? `לא נמצאו כתבות התואמות לחיפוש "${debouncedSearch}"`
                : "אין עדיין כתבות"}
            </p>
            {debouncedSearch && (
              <Button onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }} variant="outline">
                נקה חיפוש
              </Button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
