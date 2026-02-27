"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/*
  Button — branded button with all variants and sizes.
  Built with forwardRef for form library compatibility.

  Variants: primary | secondary | ghost | danger | dark | link
  Sizes:    sm | md | lg | xl | icon
*/

const variantClasses = {
  primary: [
    "bg-brand-green text-white",
    "hover:bg-brand-green-light hover:shadow-glow-green",
    "active:bg-brand-green-dark active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-green disabled:hover:shadow-none",
    "focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1F0D]",
  ].join(" "),

  secondary: [
    "bg-transparent border border-brand-green text-brand-green",
    "hover:bg-brand-green-muted hover:shadow-glow-green",
    "active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1F0D]",
  ].join(" "),

  ghost: [
    "bg-transparent text-brand-cream-muted",
    "hover:bg-white/5 hover:text-brand-cream",
    "active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  danger: [
    "bg-red-600 text-white",
    "hover:bg-red-500",
    "active:bg-red-700 active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
  ].join(" "),

  dark: [
    "bg-[#1A2E1A] text-brand-cream border border-white/10",
    "hover:bg-[#243D24] hover:border-brand-green/30",
    "active:scale-[0.98]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" "),

  link: [
    "bg-transparent text-brand-green underline-offset-4",
    "hover:underline hover:text-brand-green-light",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "p-0 h-auto font-normal",
  ].join(" "),
};

const sizeClasses = {
  sm:   "h-8 px-3 text-xs font-medium rounded-brand gap-1.5",
  md:   "h-10 px-4 text-sm font-medium rounded-brand gap-2",
  lg:   "h-12 px-6 text-base font-semibold rounded-brand gap-2",
  xl:   "h-14 px-8 text-lg font-semibold rounded-card gap-3 w-full",
  icon: "h-10 w-10 rounded-brand p-0 flex-shrink-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center",
          "font-body font-medium",
          "transition-all duration-150",
          "select-none outline-none whitespace-nowrap",
          variantClasses[variant],
          size !== "icon" ? sizeClasses[size] : sizeClasses.icon,
          isLoading && "cursor-wait",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
        )}

        {children && <span>{children}</span>}

        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
