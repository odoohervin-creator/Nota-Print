import React from "react";
import {
  AppSettings,
  CategoryKey,
  HistoryRow,
  SavedNotaTemplate,
  TemplateGroup,
} from "../types";
import StatCard from "../components/StatCard";
import { formatRupiah } from "../utils";

interface DashboardProps {
  goCreateNew: () => void;
  setCategory: React.Dispatch<React.SetStateAction<CategoryKey>>;
  templateGroups: Record<CategoryKey, TemplateGroup>;
  savedNotaTemplates: SavedNotaTemplate[];
  historyRows: HistoryRow[];
  settings: AppSettings;
  viewHistory?: () => void;
}

export default function Dashboard({
  goCreateNew,
  setCategory,
  templateGroups,
  savedNotaTemplates,
  historyRows,
  settings,
  viewHistory,
}: DashboardProps) {
  const renderCategoryIcon = (key: CategoryKey) => {
    const baseClass = "h-7 w-7";
    if (key === "makan") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <path d="M4 3v8M6.5 3v8M4 7h2.5M10 3v18M15 4h2a3 3 0 0 1 3 3v14" />
        </svg>
      );
    }
    if (key === "parkir") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <rect x="4" y="3" width="16" height="18" rx="3" />
          <path d="M9 17V7h4.2a2.4 2.4 0 1 1 0 4.8H9" />
        </svg>
      );
    }
    if (key === "belanja") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <path d="M3 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L22 8H7.2" />
          <circle cx="10" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
        <path d="M6 3h9l5 5v13H6z" />
        <path d="M15 3v5h5M9 12h8M9 16h6" />
      </svg>
    );
  };

  const todayKey = new Intl.DateTimeFormat("en-CA").format(new Date());
  const totalSavedTemplateCount = savedNotaTemplates.length;
  const totalNota = historyRows.length;
  const unprintedCount = historyRows.filter(
    (row) => !row.status.toLowerCase().includes("dicetak"),
  ).length;
  const printedCount = historyRows.filter((row) =>
    row.status.toLowerCase().includes("dicetak"),
  ).length;
  const recentRows = historyRows.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Dashboard NotaPrint
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Dashboard untuk operator nota pengganti perusahaan.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={goCreateNew}
            className="rounded-2xl bg-[#ef4444] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#dc2626]"
          >
            + Buat Nota Baru
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Nota"
          value={`${totalNota}`}
          hint={`total data hari ini (${todayKey})`}
        />
        <StatCard
          label="Belum Dicetak"
          value={`${unprintedCount}`}
          hint="antrian nota yang belum dicetak"
        />
        <StatCard
          label="Sudah Dicetak"
          value={`${printedCount}`}
          hint="nota yang sudah berhasil dicetak"
        />
        <StatCard
          label="Template Tersimpan"
          value={`${totalSavedTemplateCount}`}
          hint="preset yang siap dipakai ulang"
        />
        <StatCard
          label="Printer Default"
          value={`Thermal ${settings.paperWidth}mm`}
          hint={settings.printerName || "printer belum diatur"}
          valueClassName="text-xl leading-tight"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold">Aksi Cepat</h3>
          <p className="text-sm text-slate-600">
            Mulai dari kategori yang paling sering dipakai.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(templateGroups).map(([key, group]) => (
            <button
              key={key}
              onClick={() => {
                setCategory(key as CategoryKey);
                goCreateNew();
              }}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:bg-slate-100"
            >
              <div className="text-red-600">{renderCategoryIcon(key as CategoryKey)}</div>
              <div className="mt-4 text-base font-semibold text-slate-900">
                {group.label}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {group.templates.length} template tersedia
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Riwayat Terakhir</h3>
              <p className="text-sm text-slate-600">
                Simulasi daftar nota yang sudah dibuat.
              </p>
            </div>
            <button
              onClick={() => viewHistory && viewHistory()}
              className="text-sm font-medium text-slate-700"
            >
              Lihat semua
            </button>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3">No Nota</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3">Toko</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {row.no}
                    </td>
                    <td className="px-4 py-3">{row.jenis}</td>
                    <td className="px-4 py-3">{row.toko}</td>
                    <td className="px-4 py-3">{formatRupiah(row.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          row.status.toLowerCase().includes("dicetak")
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      Belum ada data riwayat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
