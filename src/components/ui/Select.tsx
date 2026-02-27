"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/*
  Select — branded dropdown select input.
  Matches the Input component's styling exactly.
*/

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName,
      className,
      id,
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-brand-cream-muted">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 pl-3 pr-8 text-sm appearance-none",
              "bg-[#162816] border border-white/10 rounded-brand",
              "text-brand-cream",
              "outline-none transition-all duration-150",
              "focus:border-brand-green focus:ring-2 focus:ring-brand-green/20",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-cream-dark pointer-events-none" />
        </div>

        {error && <p className="text-xs text-red-400">⚠ {error}</p>}
        {!error && helperText && <p className="text-xs text-brand-cream-dark">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
