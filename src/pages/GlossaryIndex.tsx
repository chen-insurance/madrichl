import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BreadcrumbSchema from "@/components/article/BreadcrumbSchema";
import { Loader2, BookOpen } from "lucide-react";

interface GlossaryTerm {
  id: string;
  term_name: string;
  slug: string;
  definition_rich_text: string | null;
}

const GlossaryIndex = () => {
  const { data: terms, isLoading } = useQuery({
    queryKey: ["glossary-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glossary_terms")
        .select("id, term_name, slug, definition_rich_text")
        .order("term_name");
      if (error) throw error;
      return data as GlossaryTerm[];
    },
  });

  // Group terms by first letter
  const groupedTerms = terms?.reduce((acc, term) => {
    const firstLetter = term.term_name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  const letters = groupedTerms ? Object.keys(groupedTerms).sort() : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>מילון מונחים פיננסיים | המדריך לצרכן</title>
        <meta
          name="description"
          content="מילון מונחים פיננסיים מקיף - הסברים ברורים למונחי ביטוח, פנסיה, השקעות ופיננסים אישיים."
        />
        <link rel="canonical" href="https://the-guide.co.il/glossary" />
        {/* Open Graph */}
        <meta property="og:title" content="מילון מונחים פיננסיים | המדריך לצרכן" />
        <meta property="og:description" content="מילון מונחים פיננסיים מקיף - הסברים ברורים למונחי ביטוח, פנסיה, השקעות ופיננסים אישיים." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://the-guide.co.il/glossary" />
        <meta property="og:site_name" content="המדריך לצרכן" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:image" content="https://the-guide.co.il/og-default.png" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="מילון מונחים פיננסיים | המדריך לצרכן" />
        <meta name="twitter:description" content="מילון מונחים פיננסיים מקיף - הסברים ברורים למונחי ביטוח, פנסיה, השקעות ופיננסים אישיים." />
        <meta name="twitter:image" content="https://the-guide.co.il/og-default.png" />
      </Helmet>

      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              מילון מונחים פיננסיים
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              הסברים ברורים ופשוטים למונחים מעולם הביטוח, הפנסיה, ההשקעות והפיננסים האישיים.
            </p>
          </div>

          {/* Letter Navigation */}
          {letters.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {letters.map((letter) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                >
                  {letter}
                </a>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-8">
              {letters.map((letter) => (
                <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                  <h2 className="text-2xl font-display font-bold text-accent mb-4 pb-2 border-b border-border">
                    {letter}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedTerms?.[letter].map((term) => (
                      <Link
                        key={term.id}
                        to={`/glossary/${term.slug}`}
                        className="bg-card rounded-xl p-5 border border-border hover:border-accent hover:shadow-soft transition-all group"
                      >
                        <h3 className="font-display font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                          {term.term_name}
                        </h3>
                        {term.definition_rich_text && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {term.definition_rich_text.slice(0, 100)}...
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {terms?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  המילון ריק כרגע. בקרוב יתווספו מונחים חדשים.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GlossaryIndex;
