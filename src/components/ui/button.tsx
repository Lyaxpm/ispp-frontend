import * as React from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-brand-600 text-white hover:bg-brand-500 focus-visible:ring-brand-400",
  secondary:
    "bg-slate-700 text-slate-100 hover:bg-slate-600 focus-visible:ring-slate-500",
  outline:
    "border border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 focus-visible:ring-slate-500",
  ghost: "text-slate-300 hover:bg-slate-800 hover:text-white focus-visible:ring-slate-500",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400",
  success: "bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-400",
} as const;

const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
  icon: "h-9 w-9",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
