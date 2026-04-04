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
    content?: string | null;
  };
}

const ArticleSchema = ({ article }: ArticleSchemaProps) => {
  const siteUrl = "https://the-guide.co.il";
  const logoUrl = `${siteUrl}/logo.png`;

  // Calculate reading time (Hebrew ~200 wpm)
  const wordCount = article.content?.trim().split(/\s+/).length || 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  // Truncate content for articleBody (schema limit guidance ~2500 chars)
  const articleBody = article.content
    ? article.content.replace(/#{1,6}\s?/g, "").replace(/[*_~`>]/g, "").replace(/\n{2,}/g, " ").trim().slice(0, 2500)
    : undefined;

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
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    inLanguage: "he",
    ...(articleBody ? { articleBody } : {}),
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
