import React from "react";

interface SmallFieldProps {
  label: string;
  value: string;
}

export default function SmallField({ label, value }: SmallFieldProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">
        {value || "-"}
      </div>
    </div>
  );
}
