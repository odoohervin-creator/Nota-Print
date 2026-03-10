import React from "react";
import { HistoryRow, PaperWidth } from "../types";
import { formatRupiah } from "../utils";
import { buildReceiptImageDataUrl } from "../receiptPrint";
import { printReceiptSnapshot } from "../printSystem";

interface HistoryProps {
  rows: HistoryRow[];
  paperWidth: PaperWidth;
  onDelete: (id: string) => void;
  onMarkPrinted: (id: string) => void;
}

export default function History({
  rows,
  paperWidth,
  onDelete,
  onMarkPrinted,
}: HistoryProps) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [jenisFilter, setJenisFilter] = React.useState("all");
  const [dateFilter, setDateFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedRow, setSelectedRow] = React.useState<HistoryRow | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = React.useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState("");
  const pageSize = 8;

  const jenisOptions = React.useMemo(
    () => Array.from(new Set(rows.map((row) => row.jenis))).sort(),
    [rows],
  );
  const normalizedQuery = query.trim().toLowerCase();

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      const byQuery =
        !normalizedQuery ||
        row.no.toLowerCase().includes(normalizedQuery) ||
        row.jenis.toLowerCase().includes(normalizedQuery) ||
        row.toko.toLowerCase().includes(normalizedQuery);
      const byStatus =
        statusFilter === "all" ||
        row.status.toLowerCase() === statusFilter.toLowerCase();
      const byJenis = jenisFilter === "all" || row.jenis === jenisFilter;
      const byDate = !dateFilter || row.tanggal === dateFilter;
      return byQuery && byStatus && byJenis && byDate;
    });
  }, [rows, normalizedQuery, statusFilter, jenisFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage]);

  React.useEffect(() => {
    setPage(1);
  }, [query, statusFilter, jenisFilter, dateFilter]);

  React.useEffect(() => {
    let isMounted = true;
    if (!selectedRow) {
      setPreviewDataUrl("");
      setPreviewError("");
      setIsPreviewLoading(false);
      return;
    }
    if (!selectedRow.printSnapshot) {
      setPreviewDataUrl("");
      setPreviewError("Data lama belum memiliki snapshot nota.");
      setIsPreviewLoading(false);
      return;
    }
    setIsPreviewLoading(true);
    setPreviewError("");
    buildReceiptImageDataUrl(selectedRow.printSnapshot, paperWidth)
      .then((url) => {
        if (isMounted) {
          setPreviewDataUrl(url);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPreviewError("Gagal memuat preview nota.");
          setPreviewDataUrl("");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsPreviewLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [selectedRow, paperWidth]);

  const handleExportCsv = () => {
    const headers = ["No Nota", "Jenis", "Toko", "Tanggal", "Total", "Status"];
    const escapeCsv = (value: string | number) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    const lines = [
      headers.join(","),
      ...filteredRows.map((row) =>
        [
          escapeCsv(row.no),
          escapeCsv(row.jenis),
          escapeCsv(row.toko),
          escapeCsv(row.tanggal || "-"),
          escapeCsv(row.total),
          escapeCsv(row.status),
        ].join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `riwayat-cetak-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintRow = async (row: HistoryRow) => {
    if (!row.printSnapshot) {
      window.alert(
        "Data ini belum punya snapshot nota. Simpan nota baru lalu cetak dari riwayat.",
      );
      return;
    }
    try {
      await printReceiptSnapshot(row.printSnapshot, paperWidth);
      onMarkPrinted(row.id);
    } catch {
      window.alert("Gagal cetak nota. Coba ulangi dan cek printer.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Riwayat Cetak</h2>
        <p className="mt-1 text-sm text-slate-600">
          Data nota yang sudah disimpan.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">
            Export mengikuti hasil filter saat ini.
          </div>
          <button
            onClick={handleExportCsv}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
          >
            Export CSV
          </button>
        </div>

        <div className="mb-4 grid gap-3 lg:grid-cols-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari no nota / jenis / toko"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="sudah disimpan">Sudah disimpan</option>
            <option value="sudah dicetak">Sudah dicetak</option>
          </select>
          <select
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="all">Semua Jenis</option>
            {jenisOptions.map((jenis) => (
              <option key={jenis} value={jenis}>
                {jenis}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">No Nota</th>
                <th className="px-4 py-3">Jenis</th>
                <th className="px-4 py-3">Toko</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.no}
                  </td>
                  <td className="px-4 py-3">{row.jenis}</td>
                  <td className="px-4 py-3">{row.toko}</td>
                  <td className="px-4 py-3">{row.tanggal || "-"}</td>
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRow(row)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        Lihat
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-slate-500">
            Menampilkan {pagedRows.length} dari {filteredRows.length} data
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`rounded-xl px-3 py-1 ${
                currentPage === 1
                  ? "bg-slate-100 text-slate-400"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              Prev
            </button>
            <div className="text-slate-600">
              Halaman {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`rounded-xl px-3 py-1 ${
                currentPage === totalPages
                  ? "bg-slate-100 text-slate-400"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Detail Riwayat Nota
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Informasi detail data nota tersimpan.
                </p>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700"
              >
                Tutup
              </button>
            </div>

            <div className="mt-5">
              {isPreviewLoading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                  Memuat preview nota...
                </div>
              )}
              {!isPreviewLoading && previewError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                  {previewError}
                </div>
              )}
              {!isPreviewLoading && !previewError && previewDataUrl && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <img
                    src={previewDataUrl}
                    alt="Preview nota"
                    className="mx-auto w-full max-w-[320px] rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handlePrintRow(selectedRow)}
                disabled={!selectedRow.printSnapshot || isPreviewLoading}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                  selectedRow.printSnapshot && !isPreviewLoading
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                Cetak Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
