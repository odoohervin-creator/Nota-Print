import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  valueClassName?: string;
}

export default function StatCard({
  label,
  value,
  hint,
  valueClassName,
}: StatCardProps) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 font-bold text-slate-900 ${valueClassName ?? "text-2xl"}`}>
        {value}
      </div>
      <div className="mt-auto pt-3 text-xs text-slate-500">{hint}</div>
    </div>
  );
}
