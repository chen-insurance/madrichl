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
  maxWidth,
}: OptimizedImageProps) => {
  // Determine srcset widths based on actual display size
  const effectiveMax = maxWidth || (priority ? 1024 : 1280);
  const allWidths = [320, 480, 640, 800, 1024, 1280];
  const filteredWidths = allWidths.filter(w => w <= effectiveMax);
  // Always include the effective max if not already in list
  if (!filteredWidths.includes(effectiveMax) && effectiveMax <= 1280) {
    filteredWidths.push(effectiveMax);
    filteredWidths.sort((a, b) => a - b);
  }
  const defaultWidth = Math.min(effectiveMax, 640);
  const mobileSrcSet = buildSrcSet(src, filteredWidths);

  // Compute intrinsic dimensions for width/height attributes (CLS prevention)
  const aspectDimensions = {
    video: { w: 16, h: 9 },
    square: { w: 1, h: 1 },
    portrait: { w: 3, h: 4 },
    wide: { w: 21, h: 9 },
  };
  const dims = aspectDimensions[aspectRatio];
  const intrinsicWidth = effectiveMax;
  const intrinsicHeight = Math.round(effectiveMax * dims.h / dims.w);

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
