import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

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

const ArticleCard = ({
  title,
  excerpt,
  slug,
  featured_image,
  published_at,
  category,
  variant = "default",
}: ArticleCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(published_at), {
    addSuffix: true,
    locale: he,
  });

  const placeholderImage = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop";

  if (variant === "horizontal") {
    return (
      <Link
        to={`/article/${slug}`}
        className="group flex gap-4 bg-card rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-300"
      >
        <div className="w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={featured_image || placeholderImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {category && (
            <span className="text-xs font-medium text-accent mb-1">{category}</span>
          )}
          <h3 className="font-display font-semibold text-foreground text-sm leading-snug mb-1 line-clamp-2 group-hover:text-accent transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={`/article/${slug}`}
        className="group block py-4 border-b border-border last:border-b-0"
      >
        <h3 className="font-display font-medium text-foreground text-sm leading-snug mb-1 group-hover:text-accent transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${slug}`}
      className="group block bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={featured_image || placeholderImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
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
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
