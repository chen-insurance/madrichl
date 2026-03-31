import { cn } from "@/lib/utils";
import { optimizeImageUrl, buildSrcSet } from "@/lib/image-utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Maximum display width – controls srcset generation and default src */
  maxWidth?: number;
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
  // Priority images (hero): use 640 default (mobile-first) with smaller srcset
  // Non-priority: use 640 default with standard srcset
  const defaultWidth = priority ? 640 : 640;
  const mobileSrcSet = priority
    ? buildSrcSet(src, [320, 480, 640, 800, 1024])  // Skip 1280 for hero — rarely needed at full width
    : buildSrcSet(src, [320, 480, 640, 800, 1024, 1280]);

  return (
    <div className={cn("overflow-hidden bg-secondary", aspectRatioClasses[aspectRatio])}>
      <img
        src={optimizeImageUrl(src, defaultWidth)}
        srcSet={mobileSrcSet}
        sizes={priority
          ? "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
          : sizes
        }
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={cn("w-full h-full object-cover", className)}
        onError={(e) => {
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
