import { cn } from "@/lib/utils/cn";

/*
  Spinner — animated loading ring.
  Used in buttons, page transitions, and API loading states.
*/

interface SpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "green" | "white" | "cream" | "muted";
  label?: string;
  className?: string;
  centered?: boolean;
}

const sizeMap = {
  xs: "h-3 w-3 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-9 w-9 border-[3px]",
  xl: "h-14 w-14 border-4",
};

const colorMap = {
  green: "border-brand-green border-t-transparent",
  white: "border-white border-t-transparent",
  cream: "border-brand-cream border-t-transparent",
  muted: "border-brand-cream-dark border-t-transparent",
};

export function Spinner({
  size = "md",
  color = "green",
  label,
  className,
  centered = false,
}: SpinnerProps) {
  const inner = (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div
        role="status"
        aria-label={label || "Loading"}
        className={cn("rounded-full animate-spin", sizeMap[size], colorMap[color])}
      />
      {label && (
        <p className="text-xs text-brand-cream-muted animate-pulse">{label}</p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        {inner}
      </div>
    );
  }

  return inner;
}

export function PageSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0D1F0D]/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-brand-green/20" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-brand-green border-t-transparent animate-spin" />
        </div>
        <p className="text-brand-cream-muted text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}

export default Spinner;
