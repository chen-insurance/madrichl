import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreadcrumbSchema from "@/components/article/BreadcrumbSchema";
import { Loader2, ArrowRight, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface GlossaryTerm {
  id: string;
  term_name: string;
  slug: string;
  definition_rich_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

const GlossaryTerm = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: term, isLoading, error } = useQuery({
    queryKey: ["glossary-term", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as GlossaryTerm | null;
    },
    enabled: !!slug,
  });

  // DefinedTerm Schema for SEO
  const definedTermSchema = term
    ? {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: term.term_name,
        description: term.definition_rich_text || "",
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "מילון מונחים פיננסיים - המדריך לצרכן",
          url: "https://the-guide.co.il/glossary",
        },
        url: `https://the-guide.co.il/glossary/${term.slug}`,
      }
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              המונח לא נמצא
            </h1>
            <p className="text-muted-foreground mb-4">
              המונח שחיפשתם אינו קיים במילון
            </p>
            <Link
              to="/glossary"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה למילון
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>
          {term.seo_title || `${term.term_name} - מילון מונחים`} | המדריך לצרכן
        </title>
        <meta
          name="description"
          content={
            term.seo_description ||
            term.definition_rich_text?.slice(0, 155) ||
            `הגדרת המונח ${term.term_name} במילון המונחים הפיננסי`
          }
        />
        <link
          rel="canonical"
          href={`https://the-guide.co.il/glossary/${term.slug}`}
        />
        {/* Open Graph */}
        <meta property="og:title" content={term.seo_title || `${term.term_name} - מילון מונחים | המדריך לצרכן`} />
        <meta property="og:description" content={term.seo_description || term.definition_rich_text?.slice(0, 155) || `הגדרת המונח ${term.term_name}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://the-guide.co.il/glossary/${term.slug}`} />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:image" content="https://the-guide.co.il/og-default.png" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={term.seo_title || `${term.term_name} - מילון מונחים | המדריך לצרכן`} />
        <meta name="twitter:description" content={term.seo_description || term.definition_rich_text?.slice(0, 155) || `הגדרת המונח ${term.term_name}`} />
        <meta name="twitter:image" content="https://the-guide.co.il/og-default.png" />
        {/* Structured Data */}
        {definedTermSchema && (
          <script type="application/ld+json">
            {JSON.stringify(definedTermSchema)}
          </script>
        )}
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "ראשי", url: "/" },
          { name: "מילון מונחים", url: "/glossary" },
          { name: term.term_name, url: `/glossary/${term.slug}` },
        ]}
      />

      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-accent">
              ראשי
            </Link>
            <span>/</span>
            <Link to="/glossary" className="hover:text-accent">
              מילון מונחים
            </Link>
            <span>/</span>
            <span className="text-foreground">{term.term_name}</span>
          </nav>

          {/* Term Card */}
          <article className="bg-card rounded-xl p-8 border border-border shadow-soft">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {term.term_name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  מונח מתוך המילון הפיננסי
                </p>
              </div>
            </div>

            {/* Definition */}
            <div className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed">
              {term.definition_rich_text ? (
                <ReactMarkdown>{term.definition_rich_text}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">
                  הגדרה למונח זה תתווסף בקרוב.
                </p>
              )}
            </div>

            {/* Back Link */}
            <div className="mt-8 pt-6 border-t border-border">
              <Link
                to="/glossary"
                className="inline-flex items-center gap-2 text-accent hover:underline"
              >
                <ArrowRight className="w-4 h-4" />
                חזרה למילון המונחים
              </Link>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GlossaryTerm;
