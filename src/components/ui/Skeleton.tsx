import { cn } from "@/lib/utils/cn";

////////////////////////////////////////////////////////////////////
// SKELETON COMPONENT — src/components/ui/Skeleton.tsx
//
// Placeholder loading states that mimic the shape of real content.
// Used while data is fetching to prevent layout shift and provide
// a polished loading experience instead of blank white space.
//
// Usage:
//   <Skeleton className="h-4 w-32" />
//   <ProductCardSkeleton />
//   <ProductGridSkeleton count={8} />
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// BASE SKELETON — single animated shimmer rectangle
////////////////////////////////////////////////////////////////////
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-brand",
        "bg-gradient-to-r from-[#1A2E1A] via-[rgba(124,179,66,0.05)] to-[#1A2E1A]",
        "bg-[length:200%_100%]",
        "animate-shimmer",
        className
      )}
    />
  );
}


////////////////////////////////////////////////////////////////////
// PRODUCT CARD SKELETON
// Matches the shape of ProductCard.tsx exactly
////////////////////////////////////////////////////////////////////
export function ProductCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      {/* Product image area */}
      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="p-4 space-y-3">
        {/* Category tag */}
        <Skeleton className="h-4 w-16" />

        {/* Product name */}
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />

        {/* Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-full" />
          ))}
          <Skeleton className="h-3 w-8 ml-1" />
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-24 rounded-brand" />
        </div>
      </div>
    </div>
  );
}


////////////////////////////////////////////////////////////////////
// PRODUCT GRID SKELETON
// Renders N product card skeletons in the grid
////////////////////////////////////////////////////////////////////
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}


////////////////////////////////////////////////////////////////////
// PRODUCT DETAIL SKELETON
// Matches the layout of the product detail page
////////////////////////////////////////////////////////////////////
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Left: image viewer */}
      <Skeleton className="aspect-square w-full rounded-card" />

      {/* Right: product info */}
      <div className="space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4" />
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
          <Skeleton className="h-4 w-16 ml-2" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full rounded-brand" />
        <Skeleton className="h-32 w-full rounded-card" />
      </div>
    </div>
  );
}


////////////////////////////////////////////////////////////////////
// ORDER ROW SKELETON
////////////////////////////////////////////////////////////////////
export function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/5">
      <Skeleton className="h-12 w-12 rounded-brand flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-6 w-20 rounded-pill" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}


////////////////////////////////////////////////////////////////////
// TEXT SKELETON LINES — for blog posts, descriptions
////////////////////////////////////////////////////////////////////
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  const widths = ["w-full", "w-5/6", "w-4/5", "w-3/4", "w-2/3", "w-1/2"];
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", widths[i % widths.length])}
        />
      ))}
    </div>
  );
}

export default Skeleton;
