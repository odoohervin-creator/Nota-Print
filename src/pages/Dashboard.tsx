import React from "react";
import { AppSettings, CategoryKey, HistoryRow, TemplateGroup } from "../types";
import StatCard from "../components/StatCard";
import { formatRupiah } from "../utils";

interface DashboardProps {
  goCreateNew: () => void;
  setCategory: React.Dispatch<React.SetStateAction<CategoryKey>>;
  templateGroups: Record<CategoryKey, TemplateGroup>;
  historyRows: HistoryRow[];
  settings: AppSettings;
  viewHistory?: () => void;
}

export default function Dashboard({
  goCreateNew,
  setCategory,
  templateGroups,
  historyRows,
  settings,
  viewHistory,
}: DashboardProps) {
  const todayKey = new Intl.DateTimeFormat("en-CA").format(new Date());
  const totalTemplateCount = Object.values(templateGroups).reduce(
    (acc, group) => acc + group.templates.length,
    0,
  );
  const totalNotaHariIni = historyRows.filter(
    (row) => row.tanggal === todayKey,
  ).length;
  const draftCount = historyRows.filter((row) =>
    row.status.toLowerCase().includes("draft"),
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
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm"
          >
            + Buat Nota Baru
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Nota Hari Ini"
          value={`${totalNotaHariIni}`}
          hint={`tanggal ${todayKey}`}
        />
        <StatCard
          label="Draft Belum Dicetak"
          value={`${draftCount}`}
          hint="masih menunggu finalisasi"
        />
        <StatCard
          label="Template Aktif"
          value={`${totalTemplateCount}`}
          hint="makan, parkir, dan nota lain"
        />
        <StatCard
          label="Printer Default"
          value={`Thermal ${settings.paperWidth}mm`}
          hint={settings.printerName || "Printer belum diatur"}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-semibold">Aksi Cepat</h3>
          <p className="text-sm text-slate-600">
            Mulai dari kategori yang paling sering dipakai.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {Object.entries(templateGroups).map(([key, group]) => (
            <button
              key={key}
              onClick={() => {
                setCategory(key as CategoryKey);
                goCreateNew();
              }}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:bg-slate-100"
            >
              <div className="text-2xl">{group.icon}</div>
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
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
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
