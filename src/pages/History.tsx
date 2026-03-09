import React from "react";
import { HistoryRow, PaperWidth } from "../types";
import { formatRupiah, printImageDataUrl } from "../utils";

interface HistoryProps {
  rows: HistoryRow[];
  paperWidth: PaperWidth;
  onDelete: (id: string) => void;
}

export default function History({ rows, paperWidth, onDelete }: HistoryProps) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [jenisFilter, setJenisFilter] = React.useState("all");
  const [dateFilter, setDateFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedRow, setSelectedRow] = React.useState<HistoryRow | null>(null);
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

  const handlePrintRow = (row: HistoryRow) => {
    const paperPx = paperWidth === 80 ? 576 : 420;
    const padding = 20;
    const canvas = document.createElement("canvas");
    canvas.width = paperPx;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.textBaseline = "top";

    let y = 18;
    const divider = () => {
      ctx.strokeStyle = "#000000";
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(paperPx - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);
      y += 10;
    };
    const rowLine = (left: string, right: string, bold = false) => {
      ctx.font = `${bold ? "700" : "400"} 15px 'Courier New', monospace`;
      ctx.fillText(left, padding, y);
      const rw = ctx.measureText(right).width;
      ctx.fillText(right, paperPx - padding - rw, y);
      y += 22;
    };

    const drawLogo = (done: () => void) => {
      if (!row.logoDataUrl) {
        done();
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxW = 170;
        const maxH = 80;
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = img.width * ratio;
        const h = img.height * ratio;
        ctx.drawImage(img, (paperPx - w) / 2, y, w, h);
        y += h + 8;
        done();
      };
      img.onerror = () => done();
      img.src = row.logoDataUrl;
    };

    drawLogo(() => {
      ctx.font = "700 16px 'Courier New', monospace";
      const title = row.jenis;
      const tw = ctx.measureText(title).width;
      ctx.fillText(title, (paperPx - tw) / 2, y);
      y += 24;
      divider();
      rowLine("No Nota", row.no);
      rowLine("Toko", row.toko);
      rowLine("Tanggal", row.tanggal || "-");
      rowLine("Status", row.status);
      divider();
      rowLine("TOTAL", formatRupiah(row.total), true);
      y += 6;

      const cropped = document.createElement("canvas");
      cropped.width = canvas.width;
      cropped.height = Math.max(200, y + 10);
      const cctx = cropped.getContext("2d");
      if (!cctx) return;
      cctx.fillStyle = "#ffffff";
      cctx.fillRect(0, 0, cropped.width, cropped.height);
      cctx.drawImage(canvas, 0, 0);

      printImageDataUrl(cropped.toDataURL("image/png"), paperWidth);
    });
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
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedRow(row)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        Lihat
                      </button>
                      <button
                        onClick={() => handlePrintRow(row)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        Cetak
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

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["No Nota", selectedRow.no],
                ["Jenis", selectedRow.jenis],
                ["Toko", selectedRow.toko],
                ["Tanggal", selectedRow.tanggal || "-"],
                ["Total", formatRupiah(selectedRow.total)],
                ["Status", selectedRow.status],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
