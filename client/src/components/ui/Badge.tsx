import React from "react";

export type BadgeVariant = "default" | "accent" | "outline" | "success" | "warning";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  accent: "bg-accent/10 text-accent border-accent/30",
  default: "bg-surface-elevated text-foreground-secondary border-border-subtle",
  outline: "bg-transparent text-foreground-muted border-border-medium",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
};

const dotColors: Record<BadgeVariant, string> = {
  accent: "bg-accent",
  default: "bg-foreground-muted",
  outline: "bg-foreground-muted",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[11px] px-2 py-0.5 gap-1.5",
  md: "text-xs px-2.5 py-1 gap-2",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full animate-pulse ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
