import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
  className?: string;
  priority?: boolean;
  sizes?: string;
}

// Supabase Storage image transformation parameters
const getOptimizedUrl = (url: string, width: number, quality: number = 80): string => {
  // Check if it's a Supabase storage URL
  if (url.includes("supabase.co/storage")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}width=${width}&quality=${quality}&format=webp`;
  }
  
  // For external URLs, return as-is (consider using an image CDN in production)
  return url;
};

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
  // Generate srcset for responsive images
  const widths = [320, 640, 768, 1024, 1280];
  const srcSet = widths
    .map((w) => `${getOptimizedUrl(src, w)} ${w}w`)
    .join(", ");

  return (
    <div className={cn("overflow-hidden bg-secondary", aspectRatioClasses[aspectRatio])}>
      <img
        src={getOptimizedUrl(src, 800)}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
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
