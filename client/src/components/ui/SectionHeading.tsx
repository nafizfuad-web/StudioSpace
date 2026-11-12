import React from "react";
import { Badge } from "./Badge";

export interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

const alignClasses: Record<"left" | "center" | "right", string> = {
  left: "text-left items-start",
  center: "text-center items-center mx-auto",
  right: "text-right items-end ml-auto",
};

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  align = "left",
  className = "",
}) => {
  return (
    <div className={`flex flex-col max-w-2xl ${alignClasses[align]} ${className}`}>
      {badge && (
        <div className="mb-3">
          <Badge variant="accent" size="sm" dot>
            {badge}
          </Badge>
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
};
