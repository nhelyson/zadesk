"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface HairlineProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  variant?: "subtle" | "crisp" | "fade";
}

export const Hairline: React.FC<HairlineProps> = ({
  orientation = "horizontal",
  variant = "subtle",
  className,
  ...props
}) => {
  return (
    <div
      role="separator"
      className={cn(
        orientation === "horizontal"
          ? "w-full h-[1px]"
          : "h-full w-[1px] self-stretch shrink-0",
        variant === "subtle" && "bg-slate-200/60",
        variant === "crisp" && "bg-slate-200",
        variant === "fade" &&
          (orientation === "horizontal"
            ? "bg-gradient-to-r from-transparent via-slate-200/70 to-transparent"
            : "bg-gradient-to-b from-transparent via-slate-200/70 to-transparent"),
        className
      )}
      {...props}
    />
  );
};
