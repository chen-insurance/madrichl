import { Helmet } from "react-helmet-async";

interface ArticleSchemaProps {
  article: {
    title: string;
    seo_title?: string | null;
    seo_description?: string | null;
    excerpt?: string | null;
    featured_image?: string | null;
    image_alt_text?: string | null;
    published_at?: string | null;
    updated_at: string;
    author_name?: string | null;
    slug: string;
    content?: string | null;
    category?: string | null;
  };
}

const ArticleSchema = ({ article }: ArticleSchemaProps) => {
  const siteUrl = "https://the-guide.co.il";
  // logo.png is in /public — accessible at this URL
  const logoUrl = `${siteUrl}/logo.png`;

  // Calculate reading time (Hebrew ~200 wpm)
  const wordCount = article.content?.trim().split(/\s+/).length || 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  // Truncate content for articleBody (schema limit guidance ~2500 chars)
  const articleBody = article.content
    ? article.content.replace(/#{1,6}\s?/g, "").replace(/[*_~`>]/g, "").replace(/\n{2,}/g, " ").trim().slice(0, 2500)
    : undefined;

  const imageUrl = article.featured_image || `${siteUrl}/hero-insurance.webp`;

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/news/${article.slug}`,
    },
    headline: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || "",
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 675,
      caption: article.image_alt_text || article.seo_title || article.title,
    },
    datePublished: article.published_at || article.updated_at,
    dateModified: article.updated_at,
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    inLanguage: "he",
    ...(article.category ? { articleSection: article.category } : {}),
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
        width: 200,
        height: 60,
      },
    },
  };

  // Extract FAQ pairs from h3+p patterns in HTML content
  const faqItems = (() => {
    if (!article.content) return [];
    const pairs: { q: string; a: string }[] = [];
    const h3Regex = /<h3[^>]*><span>([^<]+)<\/span><\/h3>\s*<p[^>]*><span>([^<]+)<\/span><\/p>/g;
    let match;
    while ((match = h3Regex.exec(article.content)) !== null) {
      const q = match[1].trim();
      const a = match[2].trim();
      if (q.endsWith("?") || q.includes("\u05d4\u05d0\u05dd") || q.includes("\u05d0\u05d9\u05da") || q.includes("\u05de\u05d4") || q.includes("\u05db\u05de\u05d4") || q.includes("\u05de\u05ea\u05d9")) {
        pairs.push({ q, a });
      }
    }
    return pairs.slice(0, 10);
  })();

  const faqSchema = faqItems.length >= 2 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  } : null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(newsArticleSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default ArticleSchema;
