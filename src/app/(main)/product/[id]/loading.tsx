import { ProductDetailSkeleton } from "@/components/ui/Skeleton";

/*
  src/app/(main)/product/[id]/loading.tsx
  Shown by Next.js while the product page fetches data.
*/

export default function ProductLoading() {
  return (
    <div className="container-brand section-padding">
      <ProductDetailSkeleton />
    </div>
  );
}