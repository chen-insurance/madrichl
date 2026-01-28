import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleCard from "@/components/home/ArticleCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";

const ARTICLES_PER_PAGE = 12;

const CategoryArchive = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentPage, setCurrentPage] = useState(1);

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

  // Fetch total count for pagination
  const { data: totalCount } = useQuery({
    queryKey: ["category-articles-count", category?.name],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true)
        .eq("category", category?.name);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!category?.name,
  });

  // Fetch articles for the current page
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["category-articles", category?.name, currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ARTICLES_PER_PAGE;
      const to = from + ARTICLES_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image, published_at, category")
        .eq("is_published", true)
        .eq("category", category?.name)
        .order("published_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return data;
    },
    enabled: !!category?.name,
  });

  const totalPages = totalCount ? Math.ceil(totalCount / ARTICLES_PER_PAGE) : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <link rel="canonical" href={`https://hamadrikh.co.il/category/${slug}`} />
      </Helmet>

      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Category Header */}
        <div className="mb-10">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-accent transition-colors">
              דף הבית
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{category.name}</span>
          </nav>
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-muted-foreground max-w-2xl">
              {category.description}
            </p>
          )}
          {totalCount !== undefined && (
            <p className="text-sm text-muted-foreground mt-2">
              {totalCount} מאמרים
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {articlesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
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
              אין עדיין מאמרים בקטגוריה זו.
            </p>
            <Link to="/">
              <Button>חזרה לדף הבית</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryArchive;
