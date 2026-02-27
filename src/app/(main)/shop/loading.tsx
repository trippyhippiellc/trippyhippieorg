import { ProductCardSkeleton } from "@/components/ui/Skeleton";

/*
  src/app/(main)/shop/loading.tsx
  Shown by Next.js while the shop page fetches data.
*/

export default function ShopLoading() {
  return (
    <div className="container-brand section-padding">
      <div className="mb-8">
        <div className="h-10 w-48 bg-white/5 rounded-brand animate-pulse mb-2" />
        <div className="h-5 w-72 bg-white/5 rounded-brand animate-pulse" />
      </div>
      <div className="mb-8 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 h-10 bg-white/5 rounded-brand animate-pulse" />
          <div className="w-48 h-10 bg-white/5 rounded-brand animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-8 w-24 bg-white/5 rounded-full animate-pulse" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
