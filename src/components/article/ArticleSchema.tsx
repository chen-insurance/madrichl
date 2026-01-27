import { Helmet } from "react-helmet-async";

interface ArticleSchemaProps {
  article: {
    title: string;
    excerpt?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
    updated_at: string;
    author_name?: string | null;
    slug: string;
  };
}

const ArticleSchema = ({ article }: ArticleSchemaProps) => {
  const siteUrl = "https://the-guide.co.il";
  const logoUrl = `${siteUrl}/logo.png`;

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/news/${article.slug}`,
    },
    headline: article.title,
    description: article.excerpt || "",
    image: article.featured_image || `${siteUrl}/placeholder.svg`,
    datePublished: article.published_at || article.updated_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: article.author_name || "מערכת המדריך",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "המדריך לצרכן",
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(newsArticleSchema)}
      </script>
    </Helmet>
  );
};

export default ArticleSchema;
