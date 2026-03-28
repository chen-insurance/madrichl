import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import OptimizedImage from "@/components/common/OptimizedImage";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featured_image?: string;
  published_at: string;
  category?: string;
  variant?: "default" | "horizontal" | "compact";
}

const ArticleCard = forwardRef<HTMLAnchorElement, ArticleCardProps>(({
  title,
  excerpt,
  slug,
  featured_image,
  published_at,
  category,
  variant = "default",
}: ArticleCardProps) => {
  const formattedDate = format(new Date(published_at), "dd/MM/yyyy");

  const placeholderImage = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop";

  if (variant === "horizontal") {
    return (
      <Link
        to={`/news/${slug}`}
        className="group flex gap-4 bg-card rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-300"
      >
        <div className="w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
          <OptimizedImage
            src={featured_image || placeholderImage}
            alt={title}
            aspectRatio="video"
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {category && (
            <span className="text-xs font-medium text-accent mb-1">{category}</span>
          )}
          <h3 className="font-display font-semibold text-foreground text-sm leading-snug mb-1 line-clamp-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={`/news/${slug}`}
        className="group block py-4 border-b border-border last:border-b-0"
      >
        <h3 className="font-display font-medium text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors line-clamp-2">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </Link>
    );
  }

  return (
    <Link
      to={`/news/${slug}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
    >
      <OptimizedImage
        src={featured_image || placeholderImage}
        alt={title}
        aspectRatio="video"
        className="group-hover:scale-105 transition-transform duration-300"
      />
      <div className="p-5">
        {category && (
          <span className="inline-block text-xs font-semibold text-accent mb-2">
            {category}
          </span>
        )}
        <h3 className="font-display font-bold text-foreground text-lg leading-tight mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {excerpt}
        </p>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
    </Link>
  );
};

export default ArticleCard;
