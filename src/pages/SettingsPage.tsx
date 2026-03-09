import React from "react";
import { AppSettings, PaperWidth } from "../types";

interface SettingsPageProps {
  settings: AppSettings;
  updateSettings: <K extends keyof AppSettings>(
    field: K,
    value: AppSettings[K],
  ) => void;
  saveSettings: () => void;
  resetSettings: () => void;
  isDirty: boolean;
  exportDataJson: () => void;
  importDataJson: (file: File) => Promise<void>;
}

export default function SettingsPage({
  settings,
  updateSettings,
  saveSettings,
  resetSettings,
  isDirty,
  exportDataJson,
  importDataJson,
}: SettingsPageProps) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [importMessage, setImportMessage] = React.useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Pengaturan</h2>
        <p className="mt-1 text-sm text-slate-600">
          Atur printer, ukuran kertas thermal, dan informasi toko default.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Printer & Kertas</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nama Printer Default
            </label>
            <input
              value={settings.printerName}
              onChange={(e) => updateSettings("printerName", e.target.value)}
              placeholder="Contoh: EPSON TM-T82X"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <div className="mb-2 block text-sm font-medium text-slate-700">
              Lebar Kertas Thermal
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[58, 80].map((size) => {
                const width = size as PaperWidth;
                const active = settings.paperWidth === width;
                return (
                  <button
                    key={width}
                    onClick={() => updateSettings("paperWidth", width)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {width} mm
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Data Toko Default</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nama Toko
            </label>
            <input
              value={settings.storeName}
              onChange={(e) => updateSettings("storeName", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Alamat Toko
            </label>
            <input
              value={settings.storeAddress}
              onChange={(e) => updateSettings("storeAddress", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={!isDirty}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${
              isDirty
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            Simpan Pengaturan
          </button>
          <button
            onClick={resetSettings}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
          >
            Reset ke Default
          </button>
          <div className="text-sm text-slate-500">
            {isDirty
              ? "Perubahan belum disimpan."
              : "Semua perubahan sudah disimpan."}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Backup & Restore Data
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Export data ke JSON untuk backup, lalu import kembali setelah update
          aplikasi atau pindah perangkat.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={exportDataJson}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
          >
            Export Data JSON
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
          >
            Import Data JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.currentTarget.value = "";
              if (!file) return;
              try {
                await importDataJson(file);
                setImportMessage("Import data berhasil.");
              } catch (error) {
                setImportMessage(
                  error instanceof Error
                    ? `Import gagal: ${error.message}`
                    : "Import gagal.",
                );
              }
            }}
          />
        </div>
        {importMessage && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {importMessage}
          </div>
        )}
      </section>
    </div>
  );
}
