import React from "react";
import {
  CategoryKey,
  BelanjaForm,
  FormsState,
  ItemsState,
  ItemRow,
  PrintSnapshot,
  SavedNotaTemplate,
  SelectedTemplates,
  MakanForm,
  ParkirForm,
  LainForm,
  PaperWidth,
  TemplateGroup,
} from "../types";
import { STEP_LABELS } from "../constants";
import SmallField from "../components/SmallField";
import { classNames, formatRupiah } from "../utils";
import { buildReceiptImageDataUrl } from "../receiptPrint";
import { printReceiptSnapshot } from "../printSystem";

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
  saveCurrentNota: (snapshot: PrintSnapshot) => void;
  savedNotaTemplates: SavedNotaTemplate[];
  saveCurrentAsTemplate: (name: string) => void;
  applySavedTemplate: (id: string) => void;
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
  savedNotaTemplates,
  saveCurrentAsTemplate,
  applySavedTemplate,
  paperWidth,
  templateGroups,
}: CreateNotaProps) {
  const renderCategoryIcon = (key: CategoryKey, active: boolean) => {
    const baseClass = "h-7 w-7";
    const colorClass = active ? "text-white" : "text-red-600";
    if (key === "makan") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`${baseClass} ${colorClass}`}
        >
          <path d="M4 3v8M6.5 3v8M4 7h2.5M10 3v18M15 4h2a3 3 0 0 1 3 3v14" />
        </svg>
      );
    }
    if (key === "parkir") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`${baseClass} ${colorClass}`}
        >
          <rect x="4" y="3" width="16" height="18" rx="3" />
          <path d="M9 17V7h4.2a2.4 2.4 0 1 1 0 4.8H9" />
        </svg>
      );
    }
    if (key === "belanja") {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className={`${baseClass} ${colorClass}`}
        >
          <path d="M3 5h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L22 8H7.2" />
          <circle cx="10" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={`${baseClass} ${colorClass}`}
      >
        <path d="M6 3h9l5 5v13H6z" />
        <path d="M15 3v5h5M9 12h8M9 16h6" />
      </svg>
    );
  };

  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = React.useState("");
  const [isLivePreviewLoading, setIsLivePreviewLoading] = React.useState(false);
  const [livePreviewError, setLivePreviewError] = React.useState("");
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
  const isBelanjaTemplateA =
    category === "belanja" && activeTemplate === "belanja-a";
  const isBelanjaTemplateB =
    category === "belanja" && activeTemplate === "belanja-b";
  const showExtraRow =
    category === "makan" ||
    isBelanjaTemplateA ||
    isParkirTemplateA ||
    isLainTemplateA;
  const [savedTemplateName, setSavedTemplateName] = React.useState("");
  const form = forms[category];
  const items = itemsByCategory[category];
  const savedTemplatesByCategory = React.useMemo(
    () => savedNotaTemplates.filter((template) => template.category === category),
    [savedNotaTemplates, category],
  );
  const getTemplateDesc = (templateId: string, currentDesc: string) => {
    if (currentDesc?.trim()) return currentDesc;
    if (category === "lain" && templateId === "lain-b") {
      return "Khusus service / jasa dengan format lebih ringkas.";
    }
    if (category === "lain" && templateId === "lain-c") {
      return "Untuk nota pengganti kantor / reimbursement.";
    }
    if (category === "belanja" && templateId === "belanja-b") {
      return "Versi ringkas untuk transaksi belanja cepat.";
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
  const previewContentWidthMm = paperWidth === 80 ? 70 : 48;
  const previewPrintWidthPx = paperWidth === 80 ? 332 : 228;
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

  React.useEffect(() => {
    let isMounted = true;
    setIsLivePreviewLoading(true);
    setLivePreviewError("");
    buildReceiptImageDataUrl(
      {
        category,
        templateId: activeTemplate,
        form: JSON.parse(JSON.stringify(form)),
        items: JSON.parse(JSON.stringify(items)),
      },
      paperWidth,
    )
      .then((url) => {
        if (isMounted) {
          setLivePreviewUrl(url);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLivePreviewError("Preview gagal dimuat.");
          setLivePreviewUrl("");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLivePreviewLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [category, activeTemplate, form, items, paperWidth]);

  const handlePrint = async () => {
    const snapshot = {
      category,
      templateId: activeTemplate,
      form: JSON.parse(JSON.stringify(form)),
      items: JSON.parse(JSON.stringify(items)),
    } as PrintSnapshot;
    try {
      await printReceiptSnapshot(snapshot, paperWidth);
    } catch {
      window.alert("Gagal cetak nota. Coba ulangi dan cek printer.");
    }
  };

  function renderInfoFields() {
    if (category === "makan") {
      const f = form as MakanForm;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className={isMakanTemplateA ? "" : "md:col-span-2"}>
            <div className="mb-2 text-sm font-medium text-slate-700">
              Nama Toko
            </div>
            <input
              type="text"
              value={f.toko}
              onChange={(e) => updateForm("toko", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">
              Logo Toko / Merchant
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                  Hapus
                </button>
              )}
            </div>
          </div>
          {[
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
          {isMakanTemplateA && (
            <div>
              <div className="mb-2 text-sm font-medium text-slate-700">
                Layanan
              </div>
              <select
                value={f.layanan || "Dine In"}
                onChange={(e) => updateForm("layanan", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="Dine In">Dine In</option>
                <option value="Take Away">Take Away</option>
              </select>
            </div>
          )}
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
          {f.logoDataUrl && (
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
              <img
                src={f.logoDataUrl}
                alt="Logo Toko"
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
        </div>
      );
    }

    if (category === "parkir") {
      const f = form as ParkirForm;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">
              Nama Lokasi
            </div>
            <input
              type="text"
              value={f.toko}
              onChange={(e) => updateForm("toko", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">
              Logo Toko / Merchant
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                  Hapus
                </button>
              )}
            </div>
          </div>
          {[
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
          {f.logoDataUrl && (
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
              <img
                src={f.logoDataUrl}
                alt="Logo Toko"
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
        </div>
      );
    }

    if (category === "belanja") {
      const f = form as BelanjaForm;
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">
              Nama Toko
            </div>
            <input
              type="text"
              value={f.toko}
              onChange={(e) => updateForm("toko", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">
              Logo Toko / Merchant
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                  Hapus
                </button>
              )}
            </div>
          </div>
          {[
            ["Alamat", "alamat", "text", true],
            ["Nomor Nota", "nomor", "text"],
            ["Tanggal", "tanggal", "date"],
            ...(isBelanjaTemplateA
              ? [["Atas Nama Pembeli", "pembeli", "text"]]
              : []),
            ["Metode Bayar", "metodeBayar", "text"],
            ...(isBelanjaTemplateA
              ? [["Label Biaya Tambahan", "biayaTambahanLabel", "text"]]
              : []),
          ].map(([label, field, type, wide], index) => (
            <div
              key={`${String(field)}-${index}`}
              className={wide ? "md:col-span-2" : ""}
            >
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
          {isBelanjaTemplateA && (
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
          {f.logoDataUrl && (
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
              <img
                src={f.logoDataUrl}
                alt="Logo Toko"
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
        </div>
      );
    }

    const f = form as LainForm;
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">
            Nama Toko / Perusahaan
          </div>
          <input
            type="text"
            value={f.toko}
            onChange={(e) => updateForm("toko", e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          />
        </div>
        <div>
          <div className="mb-2 text-sm font-medium text-slate-700">
            Logo Toko / Merchant
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
                Hapus
              </button>
            )}
          </div>
        </div>
        {[
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
        {f.logoDataUrl && (
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-3">
            <img
              src={f.logoDataUrl}
              alt="Logo Toko"
              className="h-16 w-auto object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  function renderReceipt() {
    const f = form as any;
    const showLogo =
      (isMakanTemplateA || isBelanjaTemplateA) &&
      Boolean((f as MakanForm).logoDataUrl);
    return (
      <div
        className="mx-auto rounded-[28px] border border-slate-300 bg-white p-4 shadow-md"
        style={{ width: `${previewPrintWidthPx}px` }}
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
          {!(isMakanTemplateB || isParkirTemplateB || isBelanjaTemplateB) && (
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
              <div className="flex justify-between gap-4">
                <span>Bayar</span>
                <span>{(f as MakanForm).metodeBayar}</span>
              </div>
              {isMakanTemplateA && (
                <>
                  <div className="flex justify-between gap-4">
                    <span>Atas Nama</span>
                    <span className="text-right">{(f as MakanForm).customer}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Layanan</span>
                    <span>{(f as MakanForm).layanan || "-"}</span>
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
          {category === "belanja" && (
            <>
              {isBelanjaTemplateA && (
                <div className="flex justify-between gap-4">
                  <span>Pembeli</span>
                  <span className="text-right">{(f as BelanjaForm).pembeli}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span>Bayar</span>
                <span>{(f as BelanjaForm).metodeBayar}</span>
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

        {!(isMakanTemplateB || isLainTemplateB || isParkirTemplateB || isBelanjaTemplateB) && (
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
                    ? "border-[#ef4444] bg-[#ef4444] text-white"
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
                        ? "bg-[#ef4444] text-white"
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
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {Object.entries(templateGroups).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key as CategoryKey)}
                    className={classNames(
                      "rounded-3xl border p-5 text-left transition",
                      category === key
                        ? "border-[#ef4444] bg-[#ef4444] text-white"
                        : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100",
                    )}
                  >
                    <div>{renderCategoryIcon(key as CategoryKey, category === key)}</div>
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
                        ? "border-[#ef4444] bg-[#ef4444] text-white"
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
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Template Nota Tersimpan
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Pilih template tersimpan untuk isi otomatis.
                </p>
                <div className="mt-3 space-y-2">
                  {savedTemplatesByCategory.slice(0, 5).map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="text-sm text-slate-800">{template.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => applySavedTemplate(template.id)}
                          className="rounded-lg bg-[#ef4444] px-3 py-1 text-xs font-medium text-white hover:bg-[#dc2626]"
                        >
                          Pakai
                        </button>
                      </div>
                    </div>
                  ))}
                  {savedTemplatesByCategory.length === 0 && (
                    <div className="text-xs text-slate-500">
                      Belum ada template tersimpan untuk kategori ini.
                    </div>
                  )}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Simpan template baru dari Step 3 (Informasi Utama).
                </div>
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
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Simpan sebagai Template
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Simpan data toko/header untuk dipakai ulang di nota berikutnya.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    value={savedTemplateName}
                    onChange={(e) => setSavedTemplateName(e.target.value)}
                    placeholder="Nama template baru"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none md:w-[260px]"
                  />
                  <button
                    onClick={() => {
                      const name = savedTemplateName.trim();
                      if (!name) return;
                      saveCurrentAsTemplate(name);
                      setSavedTemplateName("");
                    }}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    Simpan Template
                  </button>
                </div>
              </div>
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
                  className="rounded-2xl bg-[#ef4444] px-4 py-2 text-sm font-medium text-white hover:bg-[#dc2626]"
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
                  onClick={() =>
                    saveCurrentNota({
                      category,
                      templateId: activeTemplate,
                      form: JSON.parse(JSON.stringify(form)),
                      items: JSON.parse(JSON.stringify(items)),
                    })
                  }
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
                      ? "bg-[#ef4444] text-white hover:bg-[#dc2626]"
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
                  : "bg-[#ef4444] text-white hover:bg-[#dc2626]",
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
                <p className="text-sm text-slate-600">
                  Thermal {paperWidth}mm · Konten {previewContentWidthMm}mm
                </p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Aktif
              </div>
            </div>
            <div className="mt-5">
              {isLivePreviewLoading && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Memuat preview...
                </div>
              )}
              {!isLivePreviewLoading && livePreviewError && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {livePreviewError}
                </div>
              )}
              {!isLivePreviewLoading && !livePreviewError && livePreviewUrl && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={livePreviewUrl}
                    alt="Live preview nota"
                    className="mx-auto rounded-xl border border-slate-200 bg-white"
                    style={{ width: `${previewPrintWidthPx}px`, maxWidth: "100%" }}
                  />
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
