import React from "react";

interface SimplePageProps {
  title: string;
  description: string;
}

export default function SimplePage({ title, description }: SimplePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
        Mockup halaman {title}
      </div>
    </div>
  );
}
