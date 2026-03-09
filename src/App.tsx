import { useEffect, useState } from "react";
import {
  CategoryKey,
  FormsState,
  ItemsState,
  PageKey,
  SelectedTemplates,
  ItemRow,
  HistoryRow,
  AppSettings,
  TemplateGroup,
  PrintSnapshot,
  SavedNotaTemplate,
} from "./types";
import {
  TEMPLATE_GROUPS,
  DEFAULT_TEMPLATE_BY_CATEGORY,
  INITIAL_ITEMS,
  INITIAL_FORM,
  HISTORY_SAMPLES,
} from "./constants";
import { classNames } from "./utils";
import Dashboard from "./pages/Dashboard";
import CreateNota from "./pages/CreateNota";
import History from "./pages/History";
import CaraMenggunakan from "./pages/CaraMenggunakan";
import SettingsPage from "./pages/SettingsPage";
import SavedTemplatesPage from "./pages/SavedTemplatesPage";

export default function App() {
  const renderNavIcon = (icon: string) => {
    const baseClass = "h-5 w-5";
    switch (icon) {
      case "dashboard":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={baseClass}
          >
            <path d="M3 11.5L12 4l9 7.5" />
            <path d="M5 10.5V20h14v-9.5" />
          </svg>
        );
      case "buat":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={baseClass}
          >
            <rect x="5" y="3.5" width="14" height="17" rx="2" />
            <path d="M8.5 8h7M8.5 12h7M8.5 16h4.5" />
            <path d="M18.5 2v4M16.5 4h4" />
          </svg>
        );
      case "riwayat":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={baseClass}
          >
            <path d="M12 8v5l3 2" />
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v4h4" />
          </svg>
        );
      case "template":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={baseClass}
          >
            <path d="M4 6h11l5 5v7a2 2 0 0 1-2 2H4z" />
            <path d="M15 6v5h5" />
            <path d="M8 14h8M8 17h6" />
          </svg>
        );
      case "settings":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={baseClass}
          >
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 0 1-3.6 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 0 1 0-3.6h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.8 1.8 0 0 1 3.6 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1.8 1.8 0 0 1 0 3.6h-.2a1 1 0 0 0-.9.6z" />
          </svg>
        );
      case "cara":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={baseClass}
          >
            <path d="M5 4.5h9a3 3 0 0 1 3 3V19.5H8a3 3 0 0 0-3 3z" />
            <path d="M19 19.5h-9a3 3 0 0 0-3 3V7.5a3 3 0 0 1 3-3h9z" />
            <path d="M10 9h6M10 12.5h6" />
          </svg>
        );
      default:
        return null;
    }
  };
  const HISTORY_STORAGE_KEY = "nota-print-history-v1";
  const SETTINGS_STORAGE_KEY = "nota-print-settings-v1";
  const TEMPLATE_STORAGE_KEY = "nota-print-template-groups-v1";
  const SAVED_NOTA_TEMPLATE_STORAGE_KEY = "nota-print-saved-nota-template-v1";
  const DEFAULT_SETTINGS: AppSettings = {
    paperWidth: 58,
    printerName: "EPSON TM-T82X",
    storeName: "PT Indotech Trimitra Abadi",
    storeAddress:
      "Jl. Kelapa Gading No.2 Klodran Indah, Colomadu, Karanganyar, Jawa Tengah.",
  };
  const [page, setPage] = useState<PageKey>("dashboard");
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<CategoryKey>("makan");
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplates>(
    DEFAULT_TEMPLATE_BY_CATEGORY,
  );
  const [forms, setForms] = useState<FormsState>(INITIAL_FORM);
  const [itemsByCategory, setItemsByCategory] =
    useState<ItemsState>(INITIAL_ITEMS);
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>(() => {
    const fallback = HISTORY_SAMPLES;
    if (typeof window === "undefined") {
      return fallback;
    }
    try {
      const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) {
        return fallback;
      }
      const parsed = JSON.parse(raw) as HistoryRow[];
      if (!Array.isArray(parsed)) {
        return fallback;
      }
      return parsed;
    } catch {
      return fallback;
    }
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        return DEFAULT_SETTINGS;
      }
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        paperWidth: parsed.paperWidth === 58 ? 58 : 80,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [savedSettings, setSavedSettings] = useState<AppSettings>(settings);
  const [templateGroups, setTemplateGroups] = useState<
    Record<CategoryKey, TemplateGroup>
  >(() => {
    if (typeof window === "undefined") {
      return TEMPLATE_GROUPS;
    }
    try {
      const raw = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (!raw) {
        return TEMPLATE_GROUPS;
      }
      const parsed = JSON.parse(raw) as Partial<Record<CategoryKey, TemplateGroup>>;
      return {
        ...TEMPLATE_GROUPS,
        ...parsed,
      };
    } catch {
      return TEMPLATE_GROUPS;
    }
  });
  const [savedNotaTemplates, setSavedNotaTemplates] = useState<
    SavedNotaTemplate[]
  >(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const raw = window.localStorage.getItem(SAVED_NOTA_TEMPLATE_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as SavedNotaTemplate[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(historyRows),
    );
  }, [historyRows]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      SAVED_NOTA_TEMPLATE_STORAGE_KEY,
      JSON.stringify(savedNotaTemplates),
    );
  }, [savedNotaTemplates]);
  const resetCurrentCategory = () => {
    const firstTemplateId =
      templateGroups[category].templates[0]?.id ||
      DEFAULT_TEMPLATE_BY_CATEGORY[category];
    setForms((prev) => ({ ...prev, [category]: INITIAL_FORM[category] }));
    setItemsByCategory((prev) => ({
      ...prev,
      [category]: INITIAL_ITEMS[category],
    }));
    setSelectedTemplates((prev) => ({
      ...prev,
      [category]: firstTemplateId,
    }));
    setStep(1);
  };

  const updateForm = (field: string, value: string | number) => {
    setForms((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      } as FormsState[CategoryKey],
    }));
  };

  const updateItem = (id: number, field: keyof ItemRow, value: string) => {
    setItemsByCategory((prev) => ({
      ...prev,
      [category]: prev[category].map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "name" ? value : Number(value),
            }
          : item,
      ),
    }));
  };

  const addItem = () => {
    setItemsByCategory((prev) => ({
      ...prev,
      [category]: [
        ...prev[category],
        {
          id: Date.now(),
          name:
            category === "parkir"
              ? "Biaya Parkir"
              : category === "belanja"
                ? "Barang Belanja"
                : "Item Baru",
          qty: 1,
          price: 0,
        },
      ],
    }));
  };

  const removeItem = (id: number) => {
    setItemsByCategory((prev) => ({
      ...prev,
      [category]:
        prev[category].length > 1
          ? prev[category].filter((item) => item.id !== id)
          : prev[category],
    }));
  };

  const goCreateNew = () => {
    setPage("buat");
    setStep(1);
  };

  const saveCurrentNota = (snapshot: PrintSnapshot) => {
    const nowId = Date.now().toString();
    const snapshotForm = snapshot.form as any;
    const snapshotSubtotal = snapshot.items.reduce(
      (acc, item) => acc + Number(item.qty || 0) * Number(item.price || 0),
      0,
    );
    const snapshotExtra = Number(snapshotForm.biayaTambahan || 0);
    const snapshotTotal = snapshotSubtotal + snapshotExtra;
    const no = String(snapshotForm.nomor || `AUTO-${nowId}`);
    const toko = String(snapshotForm.toko || "-");
    const tanggal = String(snapshotForm.tanggal || "-");
    const logoDataUrl = String(snapshotForm.logoDataUrl || "");
    const entry: HistoryRow = {
      id: `nota-${nowId}`,
      no,
      jenis: templateGroups[snapshot.category].label,
      toko,
      total: snapshotTotal,
      status: "Sudah disimpan",
      tanggal,
      logoDataUrl,
      printSnapshot: JSON.parse(JSON.stringify(snapshot)),
    };

    setHistoryRows((prev) => [entry, ...prev]);
    setPage("riwayat");
  };
  const saveCurrentAsTemplate = (name: string) => {
    const now = new Date().toISOString();
    const entry: SavedNotaTemplate = {
      id: `saved-template-${Date.now()}`,
      name,
      category,
      templateId: selectedTemplates[category],
      form: JSON.parse(JSON.stringify(forms[category])),
      items: JSON.parse(JSON.stringify(itemsByCategory[category])),
      updatedAt: now,
    };
    setSavedNotaTemplates((prev) => [entry, ...prev]);
  };
  const applySavedTemplate = (id: string) => {
    const template = savedNotaTemplates.find((item) => item.id === id);
    if (!template) return;
    setCategory(template.category);
    setSelectedTemplates((prev) => ({
      ...prev,
      [template.category]: template.templateId,
    }));
    setForms((prev) => ({
      ...prev,
      [template.category]: JSON.parse(JSON.stringify(template.form)),
    }));
    setItemsByCategory((prev) => ({
      ...prev,
      [template.category]: JSON.parse(JSON.stringify(template.items)),
    }));
    setPage("buat");
    setStep(3);
  };
  const deleteSavedTemplate = (id: string) => {
    setSavedNotaTemplates((prev) => prev.filter((item) => item.id !== id));
  };
  const renameSavedTemplate = (id: string, name: string) => {
    setSavedNotaTemplates((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, name, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  };
  const deleteHistoryRow = (id: string) => {
    setHistoryRows((prev) => prev.filter((row) => row.id !== id));
  };
  const markHistoryRowPrinted = (id: string) => {
    setHistoryRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: "Sudah dicetak" } : row,
      ),
    );
  };
  const updateSettings = <K extends keyof AppSettings>(
    field: K,
    value: AppSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };
  const resetSettings = () => setSettings(DEFAULT_SETTINGS);
  const saveSettings = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setSavedSettings(settings);
  };
  const isSettingsDirty =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  const exportDataJson = () => {
    const payload = {
      app: "NotaPrint",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        settings,
        historyRows,
        templateGroups,
        savedNotaTemplates,
        selectedTemplates,
        forms,
        itemsByCategory,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nota-print-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = async (file: File) => {
    const content = await file.text();
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Format JSON tidak valid.");
    }

    const data = parsed?.data;
    if (!data || typeof data !== "object") {
      throw new Error("Struktur backup tidak dikenali.");
    }

    if (data.settings) {
      const nextSettings: AppSettings = {
        ...DEFAULT_SETTINGS,
        ...data.settings,
        paperWidth: data.settings.paperWidth === 80 ? 80 : 58,
      };
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(nextSettings),
      );
    }

    if (Array.isArray(data.historyRows)) {
      setHistoryRows(data.historyRows as HistoryRow[]);
    }

    if (data.templateGroups && typeof data.templateGroups === "object") {
      const mergedTemplateGroups = {
        ...TEMPLATE_GROUPS,
        ...data.templateGroups,
      } as Record<CategoryKey, TemplateGroup>;
      setTemplateGroups(
        mergedTemplateGroups,
      );
      window.localStorage.setItem(
        TEMPLATE_STORAGE_KEY,
        JSON.stringify(mergedTemplateGroups),
      );
    }

    if (Array.isArray(data.savedNotaTemplates)) {
      setSavedNotaTemplates(data.savedNotaTemplates as SavedNotaTemplate[]);
      window.localStorage.setItem(
        SAVED_NOTA_TEMPLATE_STORAGE_KEY,
        JSON.stringify(data.savedNotaTemplates),
      );
    }

    if (data.selectedTemplates && typeof data.selectedTemplates === "object") {
      setSelectedTemplates({
        ...DEFAULT_TEMPLATE_BY_CATEGORY,
        ...data.selectedTemplates,
      });
    }

    if (data.forms && typeof data.forms === "object") {
      setForms({
        ...INITIAL_FORM,
        ...data.forms,
      } as FormsState);
    }

    if (data.itemsByCategory && typeof data.itemsByCategory === "object") {
      setItemsByCategory({
        ...INITIAL_ITEMS,
        ...data.itemsByCategory,
      } as ItemsState);
    }
  };

  useEffect(() => {
    setSelectedTemplates((prev) => {
      const next: SelectedTemplates = { ...prev };
      let hasChange = false;
      (Object.keys(templateGroups) as CategoryKey[]).forEach((key) => {
        const templateIds = templateGroups[key].templates.map((tpl) => tpl.id);
        if (!templateIds.includes(prev[key])) {
          next[key] = templateIds[0] || "";
          hasChange = true;
        }
      });
      return hasChange ? next : prev;
    });
  }, [templateGroups]);

  const navItems: Array<{ key: PageKey; label: string; icon: string }> = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "buat", label: "Buat Nota Baru", icon: "buat" },
    { key: "riwayat", label: "Riwayat Cetak", icon: "riwayat" },
    { key: "template", label: "Template Tersimpan", icon: "template" },
    { key: "settings", label: "Pengaturan", icon: "settings" },
    { key: "cara", label: "Cara Menggunakan", icon: "cara" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col border-r border-black/40 bg-black p-5 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200/80">
              DESKTOP APP
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white">NotaPrint</h1>
            <div className="mt-1 text-xs font-medium text-blue-100/80">
              V.1.0.1
            </div>
            <p className="mt-2 text-sm text-blue-100/90">
              {settings.storeName}
            </p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  className={classNames(
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                    isActive
                      ? "bg-[#ef4444] text-white shadow-sm"
                      : "bg-slate-800/80 text-slate-100 hover:bg-slate-700",
                  )}
                >
                  <span
                    className={classNames(
                      "flex h-7 w-7 items-center justify-center rounded-lg",
                      isActive
                        ? "bg-white/60 text-slate-900"
                        : "bg-slate-700/80 text-slate-100",
                    )}
                  >
                    {renderNavIcon(item.icon)}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-auto pt-6 text-left text-xs font-medium text-blue-100/70">
            MIT Indotechgroup
          </div>
        </aside>
        <main className="p-6 lg:p-8">
          {page === "dashboard" && (
            <Dashboard
              goCreateNew={goCreateNew}
              setCategory={setCategory}
              templateGroups={templateGroups}
              savedNotaTemplates={savedNotaTemplates}
              historyRows={historyRows}
              settings={settings}
              viewHistory={() => setPage("riwayat")}
            />
          )}
          {page === "buat" && (
            <CreateNota
              category={category}
              setCategory={setCategory}
              step={step}
              setStep={setStep}
              selectedTemplates={selectedTemplates}
              setSelectedTemplates={setSelectedTemplates}
              forms={forms}
              updateForm={updateForm}
              itemsByCategory={itemsByCategory}
              addItem={addItem}
              updateItem={updateItem}
              removeItem={removeItem}
              resetCurrentCategory={resetCurrentCategory}
              saveCurrentNota={saveCurrentNota}
              savedNotaTemplates={savedNotaTemplates}
              saveCurrentAsTemplate={saveCurrentAsTemplate}
              applySavedTemplate={applySavedTemplate}
              paperWidth={settings.paperWidth}
              templateGroups={templateGroups}
            />
          )}
          {page === "riwayat" && (
            <History
              rows={historyRows}
              paperWidth={settings.paperWidth}
              onDelete={deleteHistoryRow}
              onMarkPrinted={markHistoryRowPrinted}
            />
          )}
          {page === "template" && (
            <SavedTemplatesPage
              templates={savedNotaTemplates}
              onUseTemplate={applySavedTemplate}
              onDeleteTemplate={deleteSavedTemplate}
              onRenameTemplate={renameSavedTemplate}
            />
          )}
          {page === "cara" && <CaraMenggunakan />}
          {page === "settings" && (
            <SettingsPage
              settings={settings}
              updateSettings={updateSettings}
              saveSettings={saveSettings}
              resetSettings={resetSettings}
              isDirty={isSettingsDirty}
              exportDataJson={exportDataJson}
              importDataJson={importDataJson}
            />
          )}
        </main>
      </div>
    </div>
  );
}
