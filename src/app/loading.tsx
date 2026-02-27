import { Leaf } from "lucide-react";

/*
  loading.tsx — global loading UI shown during page transitions
  by Next.js App Router Suspense boundaries.
*/

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1F0D]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-brand-green/20" />
          <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-brand-green border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-5 w-5 text-brand-green/60" />
          </div>
        </div>
        <p className="text-brand-cream-muted text-sm animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
