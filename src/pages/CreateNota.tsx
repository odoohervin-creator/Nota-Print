import React from "react";
import {
  CategoryKey,
  FormsState,
  ItemsState,
  ItemRow,
  SelectedTemplates,
  MakanForm,
  ParkirForm,
  LainForm,
  PaperWidth,
  TemplateGroup,
} from "../types";
import { STEP_LABELS } from "../constants";
import SmallField from "../components/SmallField";
import { classNames, formatRupiah, printImageDataUrl } from "../utils";

interface CreateNotaProps {
  category: CategoryKey;
  setCategory: React.Dispatch<React.SetStateAction<CategoryKey>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  selectedTemplates: SelectedTemplates;
  setSelectedTemplates: React.Dispatch<React.SetStateAction<SelectedTemplates>>;
  forms: FormsState;
  updateForm: (field: string, value: string | number) => void;
  itemsByCategory: ItemsState;
  addItem: () => void;
  updateItem: (id: number, field: keyof ItemRow, value: string) => void;
  removeItem: (id: number) => void;
  resetCurrentCategory: () => void;
  saveCurrentNota: () => void;
  paperWidth: PaperWidth;
  templateGroups: Record<CategoryKey, TemplateGroup>;
}

export default function CreateNota({
  category,
  setCategory,
  step,
  setStep,
  selectedTemplates,
  setSelectedTemplates,
  forms,
  updateForm,
  itemsByCategory,
  addItem,
  updateItem,
  removeItem,
  resetCurrentCategory,
  saveCurrentNota,
  paperWidth,
  templateGroups,
}: CreateNotaProps) {
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const activeTemplates = templateGroups[category].templates;
  const activeTemplate = selectedTemplates[category];
  const activeTemplateName =
    activeTemplates.find((t) => t.id === activeTemplate)?.name ?? "-";
  const isMakanTemplateA = category === "makan" && activeTemplate === "makan-a";
  const isMakanTemplateB = category === "makan" && activeTemplate === "makan-b";
  const isParkirTemplateA = category === "parkir" && activeTemplate === "parkir-a";
  const isParkirTemplateB = category === "parkir" && activeTemplate === "parkir-b";
  const isLainTemplateA = category === "lain" && activeTemplate === "lain-a";
  const isLainTemplateB = category === "lain" && activeTemplate === "lain-b";
  const isLainTemplateC = category === "lain" && activeTemplate === "lain-c";
  const showExtraRow = category === "makan" || isParkirTemplateA || isLainTemplateA;
  const form = forms[category];
  const items = itemsByCategory[category];
  const getTemplateDesc = (templateId: string, currentDesc: string) => {
    if (currentDesc?.trim()) return currentDesc;
    if (category === "lain" && templateId === "lain-b") {
      return "Khusus service / jasa dengan format lebih ringkas.";
    }
    if (category === "lain" && templateId === "lain-c") {
      return "Untuk nota pengganti kantor / reimbursement.";
    }
    return "Template siap pakai.";
  };

  const subtotal = React.useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + Number(item.qty || 0) * Number(item.price || 0),
        0,
      ),
    [items],
  );
  const extra = Number((form as any).biayaTambahan || 0);
  const total = subtotal + extra;
  const previewWidthPx = paperWidth === 80 ? 300 : 220;
  const parkirDurationText = React.useMemo(() => {
    if (category !== "parkir") return "-";
    const f = form as ParkirForm;
    const [inH = "0", inM = "0"] = (f.jamMasuk || "0:0").split(":");
    const [outH = "0", outM = "0"] = (f.jamKeluar || "0:0").split(":");
    const start = Number(inH) * 60 + Number(inM);
    const end = Number(outH) * 60 + Number(outM);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "-";
    const diff = end - start;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h > 0 && m > 0) return `${h} Jam ${m} Menit`;
    if (h > 0) return `${h} Jam`;
    return `${m} Menit`;
  }, [category, form]);

  const nextStep = () => setStep((s) => Math.min(5, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  React.useEffect(() => {
    if (step !== 5) {
      setIsConfirmed(false);
    }
  }, [step, category, activeTemplate]);

  const handlePrint = async () => {
    const f = form as MakanForm | ParkirForm | LainForm;

    const infoRows = [
      { label: "No Nota", value: f.nomor || "-" },
      { label: "Tanggal", value: f.tanggal || "-" },
    ];
    if (isMakanTemplateA) {
      infoRows.push(
        { label: "Jam", value: (f as MakanForm).jam || "-" },
        { label: "Atas Nama", value: (f as MakanForm).customer || "-" },
        { label: "Bayar", value: (f as MakanForm).metodeBayar || "-" },
      );
    } else if (isMakanTemplateB) {
      infoRows.push({ label: "Jam", value: (f as MakanForm).jam || "-" });
    }
    if (isParkirTemplateA) {
      infoRows.push(
        { label: "Plat No", value: (f as ParkirForm).platNomor || "-" },
        { label: "Kendaraan", value: (f as ParkirForm).kendaraan || "-" },
        { label: "Masuk", value: (f as ParkirForm).jamMasuk || "-" },
        { label: "Keluar", value: (f as ParkirForm).jamKeluar || "-" },
      );
    } else if (isParkirTemplateB) {
      infoRows.push(
        { label: "Plat No", value: (f as ParkirForm).platNomor || "-" },
        { label: "Kendaraan", value: (f as ParkirForm).kendaraan || "-" },
      );
    }
    if (isLainTemplateA) {
      infoRows.push(
        { label: "Customer", value: (f as LainForm).pihak || "-" },
        { label: "Ket.", value: (f as LainForm).keterangan || "-" },
      );
    } else if (isLainTemplateB) {
      infoRows.push({ label: "Layanan", value: (f as LainForm).keterangan || "-" });
    } else if (isLainTemplateC) {
      infoRows.push(
        { label: "Pembeli", value: (f as LainForm).pihak || "-" },
        { label: "Keperluan", value: (f as LainForm).keterangan || "-" },
      );
    }

    const wrapText = (
      ctx: CanvasRenderingContext2D,
      text: string,
      maxWidth: number,
    ) => {
      const words = String(text || "-").split(" ");
      const lines: string[] = [];
      let line = "";
      words.forEach((word) => {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
      return lines;
    };

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const paperPx = paperWidth === 80 ? 576 : 420;
    const padding = 20;
    const innerWidth = paperPx - padding * 2;
    const canvas = document.createElement("canvas");
    canvas.width = paperPx;
    canvas.height =
      360 +
      infoRows.length * 24 +
      items.length * 40 +
      (f.catatan ? Math.ceil(f.catatan.length / 32) * 20 : 20);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.textBaseline = "top";
    ctx.font = "16px 'Courier New', monospace";
    let y = 16;

    const logoSrc = isMakanTemplateA ? (f as MakanForm).logoDataUrl || "" : "";
    if (logoSrc) {
      try {
        const logo = await loadImage(logoSrc);
        const maxW = 180;
        const maxH = 80;
        const ratio = Math.min(maxW / logo.width, maxH / logo.height, 1);
        const w = logo.width * ratio;
        const h = logo.height * ratio;

        const logoCanvas = document.createElement("canvas");
        logoCanvas.width = Math.max(1, Math.round(w));
        logoCanvas.height = Math.max(1, Math.round(h));
        const lctx = logoCanvas.getContext("2d");
        if (lctx) {
          lctx.drawImage(logo, 0, 0, logoCanvas.width, logoCanvas.height);

          // Thermal-friendly conversion: grayscale + threshold to pure black/white.
          const imageData = lctx.getImageData(
            0,
            0,
            logoCanvas.width,
            logoCanvas.height,
          );
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            if (a < 40) {
              data[i] = 255;
              data[i + 1] = 255;
              data[i + 2] = 255;
              data[i + 3] = 255;
              continue;
            }
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const bw = gray < 165 ? 0 : 255;
            data[i] = bw;
            data[i + 1] = bw;
            data[i + 2] = bw;
            data[i + 3] = 255;
          }
          lctx.putImageData(imageData, 0, 0);
          ctx.drawImage(logoCanvas, (paperPx - w) / 2, y, w, h);
        } else {
          ctx.drawImage(logo, (paperPx - w) / 2, y, w, h);
        }
        y += h + 8;
      } catch {
        // ignore logo load errors
      }
    }

    const centerLine = (text: string, bold = false) => {
      ctx.font = `${bold ? "700" : "400"} 16px 'Courier New', monospace`;
      const t = String(text || "-");
      const w = ctx.measureText(t).width;
      ctx.fillText(t, (paperPx - w) / 2, y);
      y += 22;
    };
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
    const row = (left: string, right: string, bold = false) => {
      ctx.font = `${bold ? "700" : "400"} 15px 'Courier New', monospace`;
      const l = String(left || "-");
      const r = String(right || "-");
      ctx.fillText(l, padding, y);
      const rw = ctx.measureText(r).width;
      ctx.fillText(r, paperPx - padding - rw, y);
      y += 22;
    };

    if (isMakanTemplateB) {
      centerLine(f.toko || "-", true);
    } else {
      centerLine(f.toko || "-", true);
      wrapText(ctx, f.alamat || "-", innerWidth).forEach((line) => centerLine(line));
    }
    divider();
    infoRows.forEach((info) => row(info.label, info.value));
    divider();

    items.forEach((item) => {
      ctx.font = "700 15px 'Courier New', monospace";
      ctx.fillText(item.name || "-", padding, y);
      y += 20;
      row(
        `${item.qty} x ${formatRupiah(item.price)}`,
        formatRupiah(item.qty * item.price),
      );
    });

    divider();
    row("Subtotal", formatRupiah(subtotal));
    row(f.biayaTambahanLabel || "Biaya Tambahan", formatRupiah(extra));
    row("TOTAL", formatRupiah(total), true);
    divider();

    if (!(isMakanTemplateB || isLainTemplateB || isParkirTemplateB)) {
      wrapText(ctx, f.catatan || "-", innerWidth).forEach((line) => centerLine(line));
    }
    y += 8;

    if (isParkirTemplateA || isParkirTemplateB) {
      y = 16;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000000";
      centerLine(f.toko || "-", true);
      if (isParkirTemplateA && (f as ParkirForm).alamat) {
        wrapText(ctx, (f as ParkirForm).alamat, innerWidth).forEach((line) =>
          centerLine(line),
        );
      }
      divider();

      if (isParkirTemplateA) {
        row("No Nota", f.nomor || "-");
        row("Tanggal", f.tanggal || "-");
        y += 4;
        row("Plat", (f as ParkirForm).platNomor || "-");
        row("Jenis", (f as ParkirForm).kendaraan || "-");
        y += 4;
        row("Masuk", (f as ParkirForm).jamMasuk || "-");
        row("Keluar", (f as ParkirForm).jamKeluar || "-");
        row("Durasi", parkirDurationText);
        divider();
        row((items[0]?.name || "Biaya Parkir").replace(/\s+/g, " "), formatRupiah(subtotal));
        divider();
        row("TOTAL", formatRupiah(total), true);
      }

      if (isParkirTemplateB) {
        row("No", f.nomor || "-");
        centerLine(f.tanggal || "-");
        divider();
        row("Plat", (f as ParkirForm).platNomor || "-");
        centerLine((f as ParkirForm).kendaraan || "-");
        divider();
        row("Parkir", formatRupiah(subtotal));
        divider();
        row("TOTAL", formatRupiah(total), true);
      }

      divider();
      const closing =
        isParkirTemplateA
          ? f.catatan || "Terima kasih"
          : f.catatan || "Simpan nota ini";
      wrapText(ctx, closing, innerWidth).forEach((line) => centerLine(line));
      y += 8;
    }

    const cropped = document.createElement("canvas");
    cropped.width = canvas.width;
    cropped.height = Math.max(200, Math.min(canvas.height, y + 10));
    const cctx = cropped.getContext("2d");
    if (!cctx) return;
    cctx.fillStyle = "#ffffff";
    cctx.fillRect(0, 0, cropped.width, cropped.height);
    cctx.drawImage(canvas, 0, 0);

    printImageDataUrl(cropped.toDataURL("image/png"), paperWidth);
  };

  function renderInfoFields() {
    if (category === "makan") {
      const f = form as MakanForm;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Nama Toko", "toko", "text"],
            ["Alamat", "alamat", "text", true],
            ["Nomor Nota", "nomor", "text"],
            ["Tanggal", "tanggal", "date"],
            ["Jam", "jam", "time"],
            ["Atas Nama", "customer", "text"],
            ["Metode Bayar", "metodeBayar", "text"],
            ["Label Biaya Tambahan", "biayaTambahanLabel", "text"],
          ].map(([label, field, type, wide], index) => (
            <div key={`${String(field)}-${index}`} className={wide ? "md:col-span-2" : ""}>
              <div className="mb-2 text-sm font-medium text-slate-700">
                {label}
              </div>
              <input
                type={type as string}
                value={String(
                  (f as Record<string, string | number>)[field as string],
                )}
                onChange={(e) => updateForm(field as string, e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </div>
          ))}
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">
              Nominal Biaya Tambahan
            </div>
            <input
              type="number"
              value={f.biayaTambahan}
              onChange={(e) =>
                updateForm("biayaTambahan", Number(e.target.value))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <div className="mb-2 text-sm font-medium text-slate-700">
              Catatan
            </div>
            <textarea
              value={f.catatan}
              onChange={(e) => updateForm("catatan", e.target.value)}
              className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          {isMakanTemplateA && (
            <div className="md:col-span-2">
              <div className="mb-2 text-sm font-medium text-slate-700">
                Logo Toko / Merchant
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        updateForm("logoDataUrl", String(reader.result || ""));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                {f.logoDataUrl && (
                  <button
                    onClick={() => updateForm("logoDataUrl", "")}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
              {f.logoDataUrl && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <img
                    src={f.logoDataUrl}
                    alt="Logo Toko"
                    className="h-16 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (category === "parkir") {
      const f = form as ParkirForm;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Nama Lokasi", "toko", "text"],
            ...(isParkirTemplateA ? [["Alamat / Area", "alamat", "text", true]] : []),
            ["Nomor Nota", "nomor", "text"],
            ["Tanggal", "tanggal", "date"],
            ...(isParkirTemplateA
              ? [
                  ["Jam Masuk", "jamMasuk", "time"],
                  ["Jam Keluar", "jamKeluar", "time"],
                ]
              : []),
            ["Plat Nomor", "platNomor", "text"],
            ["Jenis Kendaraan", "kendaraan", "text"],
            ...(isParkirTemplateA
              ? [["Label Biaya Tambahan", "biayaTambahanLabel", "text"]]
              : []),
          ].map(([label, field, type, wide], index) => (
            <div key={`${String(field)}-${index}`} className={wide ? "md:col-span-2" : ""}>
              <div className="mb-2 text-sm font-medium text-slate-700">
                {label}
              </div>
              <input
                type={type as string}
                value={String(
                  (f as Record<string, string | number>)[field as string],
                )}
                onChange={(e) => updateForm(field as string, e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </div>
          ))}
          {isParkirTemplateA && (
            <div>
              <div className="mb-2 text-sm font-medium text-slate-700">
                Nominal Biaya Tambahan
              </div>
              <input
                type="number"
                value={f.biayaTambahan}
                onChange={(e) =>
                  updateForm("biayaTambahan", Number(e.target.value))
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </div>
          )}
          <div className="md:col-span-2">
            <div className="mb-2 text-sm font-medium text-slate-700">
              Catatan
            </div>
            <textarea
              value={f.catatan}
              onChange={(e) => updateForm("catatan", e.target.value)}
              className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>
      );
    }

    const f = form as LainForm;
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Nama Toko / Perusahaan", "toko", "text"],
          ["Alamat", "alamat", "text", true],
          ["Nomor Nota", "nomor", "text"],
          ["Tanggal", "tanggal", "date"],
          ...((isLainTemplateA || isLainTemplateC)
            ? [
                [
                  isLainTemplateC ? "Pembeli / Penerima" : "Pihak / Customer",
                  "pihak",
                  "text",
                ],
              ]
            : []),
          [
            isLainTemplateB
              ? "Jenis Jasa / Service"
              : isLainTemplateC
                ? "Keperluan Reimbursement"
                : "Keterangan",
            "keterangan",
            "text",
          ],
          ...(isLainTemplateA
            ? [["Label Biaya Tambahan", "biayaTambahanLabel", "text"]]
            : []),
        ].map(([label, field, type, wide], index) => (
          <div key={`${String(field)}-${index}`} className={wide ? "md:col-span-2" : ""}>
            <div className="mb-2 text-sm font-medium text-slate-700">
              {label}
            </div>
            <input
              type={type as string}
              value={String(
                (f as Record<string, string | number>)[field as string],
              )}
              onChange={(e) => updateForm(field as string, e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
        ))}
        {isLainTemplateA && (
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">
              Nominal Biaya Tambahan
            </div>
            <input
              type="number"
              value={f.biayaTambahan}
              onChange={(e) =>
                updateForm("biayaTambahan", Number(e.target.value))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
        )}
        <div className="md:col-span-2">
          <div className="mb-2 text-sm font-medium text-slate-700">Catatan</div>
          <textarea
            value={f.catatan}
            onChange={(e) => updateForm("catatan", e.target.value)}
            className="min-h-[90px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          />
        </div>
      </div>
    );
  }

  function renderReceipt() {
    const f = form as any;
    const showLogo = isMakanTemplateA && Boolean((f as MakanForm).logoDataUrl);
    return (
      <div
        className="mx-auto rounded-[28px] border border-slate-300 bg-white p-4 shadow-md"
        style={{ width: `${previewWidthPx}px` }}
      >
        {showLogo && (
          <div className="mb-2 flex justify-center">
            <img
              src={(f as MakanForm).logoDataUrl}
              alt="Logo Toko"
              className="max-h-[72px] w-auto object-contain"
            />
          </div>
        )}
        <div className="text-center">
          <div className="text-sm font-bold uppercase">{f.toko}</div>
          {!(isMakanTemplateB || isParkirTemplateB) && (
            <div className="mt-1 text-[11px] leading-4 text-slate-600">
              {f.alamat}
            </div>
          )}
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="space-y-1 text-[11px] leading-4">
          <div className="flex justify-between gap-4">
            <span>No Nota</span>
            <span>{f.nomor}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Tanggal</span>
            <span>{f.tanggal}</span>
          </div>

          {category === "makan" && (
            <>
              <div className="flex justify-between gap-4">
                <span>Jam</span>
                <span>{(f as MakanForm).jam}</span>
              </div>
              {isMakanTemplateA && (
                <>
                  <div className="flex justify-between gap-4">
                    <span>Atas Nama</span>
                    <span className="text-right">{(f as MakanForm).customer}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Bayar</span>
                    <span>{(f as MakanForm).metodeBayar}</span>
                  </div>
                </>
              )}
            </>
          )}

          {category === "parkir" && (
            <>
              {isParkirTemplateA && (
                <>
                  <div className="flex justify-between gap-4">
                    <span>Plat</span>
                    <span>{(f as ParkirForm).platNomor}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Jenis</span>
                    <span>{(f as ParkirForm).kendaraan}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Masuk</span>
                    <span>{(f as ParkirForm).jamMasuk}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Keluar</span>
                    <span>{(f as ParkirForm).jamKeluar}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Durasi</span>
                    <span>{parkirDurationText}</span>
                  </div>
                </>
              )}
              {isParkirTemplateB && (
                <>
                  <div className="flex justify-between gap-4">
                    <span>Plat</span>
                    <span>{(f as ParkirForm).platNomor}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Kendaraan</span>
                    <span>{(f as ParkirForm).kendaraan}</span>
                  </div>
                </>
              )}
            </>
          )}

          {category === "lain" && (
            <>
              {(isLainTemplateA || isLainTemplateC) && (
                <div className="flex justify-between gap-4">
                  <span>{isLainTemplateC ? "Pembeli" : "Customer"}</span>
                  <span className="text-right">{(f as LainForm).pihak}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span>
                  {isLainTemplateB
                    ? "Layanan"
                    : isLainTemplateC
                      ? "Keperluan"
                      : "Ket."}
                </span>
                <span className="text-right">{(f as LainForm).keterangan}</span>
              </div>
            </>
          )}
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="space-y-2 text-[11px] leading-4">
          {category === "parkir" ? (
            <div>
              <div className="font-medium">
                {isParkirTemplateB ? "Parkir" : items[0]?.name || "Biaya Parkir"}
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id}>
                <div className="font-medium">{item.name}</div>
                <div className="flex justify-between text-slate-600">
                  <span>
                    {item.qty} x {formatRupiah(item.price)}
                  </span>
                  <span>{formatRupiah(item.qty * item.price)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          {showExtraRow && (
            <div className="flex justify-between">
              <span>{f.biayaTambahanLabel || "Biaya Tambahan"}</span>
              <span>{formatRupiah(extra)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span>{formatRupiah(total)}</span>
          </div>
        </div>

        {!(isMakanTemplateB || isLainTemplateB || isParkirTemplateB) && (
          <>
            <div className="my-3 border-t border-dashed border-slate-300" />
            <div className="text-center text-[10px] leading-4 text-slate-600">
              {f.catatan}
            </div>
          </>
        )}
        {isParkirTemplateB && (
          <>
            <div className="my-3 border-t border-dashed border-slate-300" />
            <div className="text-center text-[10px] leading-4 text-slate-600">
              {f.catatan || "Simpan nota ini"}
            </div>
          </>
        )}
      </div>
    );
  }

  function renderStepper() {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {STEP_LABELS.map((label, idx) => {
            const number = idx + 1;
            const active = step === number;
            const done = step > number;
            return (
              <button
                key={label}
                onClick={() => setStep(number)}
                className={classNames(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition",
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : done
                      ? "border-slate-300 bg-slate-100 text-slate-800"
                      : "border-slate-200 bg-white text-slate-500",
                )}
              >
                <div
                  className={classNames(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    active
                      ? "bg-white text-slate-900"
                      : done
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700",
                  )}
                >
                  {number}
                </div>
                <div className="text-xs font-medium sm:text-sm">{label}</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Buat Nota Baru</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mode input menggunakan multi-step supaya operator lebih fokus dan
            rapi.
          </p>
        </div>
      </div>

      {renderStepper()}

      <div className="grid gap-6 xl:grid-cols-[1fr_370px]">
        <div className="space-y-6">
          {step === 1 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">
                Step 1 — Pilih Kategori Nota
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Pilih kategori dulu, supaya template dan field otomatis
                menyesuaikan.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {Object.entries(templateGroups).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key as CategoryKey)}
                    className={classNames(
                      "rounded-3xl border p-5 text-left transition",
                      category === key
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100",
                    )}
                  >
                    <div className="text-2xl">{value.icon}</div>
                    <div className="mt-4 text-base font-semibold">
                      {value.label}
                    </div>
                    <div
                      className={classNames(
                        "mt-1 text-sm",
                        category === key ? "text-slate-300" : "text-slate-500",
                      )}
                    >
                      {value.templates.length} template tersedia
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">Step 2 — Pilih Template</h3>
              <p className="mt-1 text-sm text-slate-600">
                Pilih template yang paling sesuai dengan kebutuhan cetak.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {activeTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() =>
                      setSelectedTemplates((prev) => ({
                        ...prev,
                        [category]: tpl.id,
                      }))
                    }
                    className={classNames(
                      "rounded-3xl border p-5 text-left transition",
                      activeTemplate === tpl.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100",
                    )}
                  >
                    <div className="text-base font-semibold">{tpl.name}</div>
                    <div
                      className={classNames(
                        "mt-2 text-sm",
                        activeTemplate === tpl.id
                          ? "text-slate-300"
                          : "text-slate-500",
                      )}
                    >
                      {getTemplateDesc(tpl.id, tpl.desc)}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">
                Step 3 — Informasi Utama
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Isi data header, customer, waktu, dan keterangan utama nota.
              </p>
              <div className="mt-5">{renderInfoFields()}</div>
            </section>
          )}

          {step === 4 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    Step 4 — Detail Transaksi
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Tambah item, ubah qty, harga, dan cek total otomatis.
                  </p>
                </div>
                <button
                  onClick={addItem}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  + Tambah Item
                </button>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama Item</th>
                      <th className="px-4 py-3 font-medium">Qty</th>
                      <th className="px-4 py-3 font-medium">Harga</th>
                      <th className="px-4 py-3 font-medium">Subtotal</th>
                      <th className="px-4 py-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <input
                            value={item.name}
                            onChange={(e) =>
                              updateItem(item.id, "name", e.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              updateItem(item.id, "qty", e.target.value)
                            }
                            className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(item.id, "price", e.target.value)
                            }
                            className="w-32 rounded-xl border border-slate-200 bg-white px-3 py-2"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatRupiah(item.qty * item.price)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold">
                Step 5 — Preview & Simpan
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Cek ringkasan terakhir sebelum simpan atau print.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <SmallField
                    label="Kategori"
                    value={templateGroups[category].label}
                  />
                <SmallField label="Template" value={activeTemplateName} />
                <SmallField label="Total" value={formatRupiah(total)} />
                <SmallField
                  label="Jumlah Item"
                  value={`${items.length} item`}
                />
                <SmallField label="Nomor Nota" value={form.nomor} />
                <SmallField label="Tanggal" value={form.tanggal} />
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Jika data sudah benar, klik tombol simpan untuk memasukkan nota
                ke riwayat cetak.
                <label className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Saya yakin data sudah sesuai
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={saveCurrentNota}
                  disabled={!isConfirmed}
                  className={classNames(
                    "rounded-2xl px-4 py-2 text-sm font-medium",
                    isConfirmed
                      ? "border border-slate-300 bg-white text-slate-900"
                      : "bg-slate-100 text-slate-400",
                  )}
                >
                  Simpan Nota ke Riwayat
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!isConfirmed}
                  className={classNames(
                    "rounded-2xl px-4 py-2 text-sm font-medium",
                    isConfirmed
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-400",
                  )}
                >
                  Cetak
                </button>
              </div>
            </section>
          )}

          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={classNames(
                "rounded-2xl px-4 py-2 text-sm font-medium",
                step === 1
                  ? "bg-slate-100 text-slate-400"
                  : "border border-slate-300 bg-white text-slate-900",
              )}
            >
              ← Back
            </button>
            <div className="text-sm text-slate-500">
              Step {step} dari {STEP_LABELS.length}
            </div>
            <button
              onClick={nextStep}
              disabled={step === 5}
              className={classNames(
                "rounded-2xl px-4 py-2 text-sm font-medium",
                step === 5
                  ? "bg-slate-100 text-slate-400"
                  : "bg-slate-900 text-white",
              )}
            >
              Next →
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <p className="text-sm text-slate-600">Thermal {paperWidth}mm</p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Aktif
              </div>
            </div>
            <div className="mt-5">{renderReceipt()}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
