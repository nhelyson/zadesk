import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200",
        glass && "glass-card border-white/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
