"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/*
  Input — branded input field with label, error state, helper text,
  and optional left/right addons. Used on every form across the site.
*/

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-brand-cream-muted"
          >
            {label}
            {props.required && (
              <span className="text-red-400 ml-1">*</span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 flex items-center text-brand-cream-dark pointer-events-none">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 bg-[#162816] border border-white/10 rounded-brand",
              "px-3 py-2 text-sm text-brand-cream font-body",
              "placeholder:text-brand-cream-dark",
              "outline-none transition-all duration-150",
              "focus:border-brand-green focus:ring-2 focus:ring-brand-green/20",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftAddon && "pl-9",
              rightAddon && "pr-9",
              className
            )}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3 flex items-center">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs text-brand-cream-dark">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, containerClassName, className, id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-brand-cream-muted"
          >
            {label}
            {props.required && (
              <span className="text-red-400 ml-1">*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full min-h-[100px] bg-[#162816] border border-white/10 rounded-brand",
            "px-3 py-2 text-sm text-brand-cream font-body",
            "placeholder:text-brand-cream-dark",
            "outline-none resize-y transition-all duration-150",
            "focus:border-brand-green focus:ring-2 focus:ring-brand-green/20",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-400">⚠ {error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-brand-cream-dark">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Input;
