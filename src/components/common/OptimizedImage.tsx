import { cn } from "@/lib/utils";
import { optimizeImageUrl, buildSrcSet } from "@/lib/image-utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const aspectRatioClasses = {
  video: "aspect-video", // 16:9
  square: "aspect-square", // 1:1
  portrait: "aspect-[3/4]", // 3:4
  wide: "aspect-[21/9]", // 21:9
};

const OptimizedImage = ({
  src,
  alt,
  aspectRatio = "video",
  className,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: OptimizedImageProps) => {
  return (
    <div className={cn("overflow-hidden bg-secondary", aspectRatioClasses[aspectRatio])}>
      <img
        src={optimizeImageUrl(src, 800)}
        srcSet={buildSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={cn("w-full h-full object-cover", className)}
        onError={(e) => {
          // Fallback to original URL if optimization fails
          const img = e.target as HTMLImageElement;
          if (img.src !== src) {
            img.src = src;
          }
        }}
      />
    </div>
  );
};

export default OptimizedImage;
