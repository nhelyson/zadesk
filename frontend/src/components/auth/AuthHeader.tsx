import React from "react";

interface AuthHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  align?: "left" | "center";
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  description,
  badge,
  align = "center",
}) => {
  const isCenter = align === "center";

  return (
    <div className={`mb-6 space-y-1.5 ${isCenter ? "text-center" : "text-left"}`}>
      {badge && (
        <div className={`flex ${isCenter ? "justify-center" : "justify-start"} mb-1`}>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            {badge}
          </span>
        </div>
      )}
      <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};

