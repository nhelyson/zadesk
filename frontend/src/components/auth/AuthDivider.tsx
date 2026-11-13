import React from "react";

interface AuthDividerProps {
  label?: string;
  pillColor?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({
  label = "OU",
  pillColor = "bg-emerald-600",
}) => {
  return (
    <div className="relative my-4 text-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200" />
      </div>
      <span className={`relative ${pillColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider select-none shadow-2xs`}>
        {label}
      </span>
    </div>
  );
};



