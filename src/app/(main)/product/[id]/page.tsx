import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ReviewList } from "@/components/product/ReviewList";
import type { Metadata } from "next";

/*
  src/app/(main)/product/[id]/page.tsx
  Server component. createClient() from @/lib/supabase/server is async — must be awaited.
*/

interface Props {
  params: { id: string };
}

// Fix: Add explicit type for Supabase query result
interface ProductMeta {
  name: string;
  description: string | null;
  images?: unknown;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, description, images")
    .eq("id", params.id)
    .single<ProductMeta>();

  if (!data) return { title: "Product Not Found" };

  return {
    title: data.name,
    description: data.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const supabase = await createClient();   // ← MUST await

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: product } = await (supabase.from("products") as any)
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: related } = await (supabase.from("products") as any)
    .select("*")
    .eq("category", product.category)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  return (
    <div>
      <ProductDetailClient product={product} />

      {/* Reviews section */}
      <section className="container-brand py-12 border-t border-white/5">
        <ReviewList
          productId={product.id}
          averageRating={product.average_rating ?? 0}
          reviewCount={product.review_count ?? 0}
        />
      </section>

      {/* Related products */}
      {related && related.length > 0 && (
        <section className="container-brand pb-16">
          <h2 className="text-2xl font-display font-bold text-brand-cream mb-6">
            More {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p: Record<string, unknown>) => (
              <a key={p.id as string} href={`/product/${p.id}`} className="glass-card border border-white/5 hover:border-brand-green/20 p-4 rounded-card transition-all group">
                <p className="font-medium text-brand-cream text-sm group-hover:text-brand-green transition-colors line-clamp-2">{p.name as string}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
