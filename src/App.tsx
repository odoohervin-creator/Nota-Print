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
  const HISTORY_STORAGE_KEY = "nota-print-history-v1";
  const SETTINGS_STORAGE_KEY = "nota-print-settings-v1";
  const TEMPLATE_STORAGE_KEY = "nota-print-template-groups-v1";
  const SAVED_NOTA_TEMPLATE_STORAGE_KEY = "nota-print-saved-nota-template-v1";
  const DEFAULT_SETTINGS: AppSettings = {
    paperWidth: 58,
    printerName: "EPSON TM-T82X",
    storeName: "NotaPrint Store",
    storeAddress: "Jl. Contoh No. 1",
  };
  const [page, setPage] = useState<PageKey>("dashboard");
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<CategoryKey>("makan");
  const [selectedTemplates, setSelectedTemplates] =
    useState<SelectedTemplates>(DEFAULT_TEMPLATE_BY_CATEGORY);
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
      const parsed = JSON.parse(raw) as Record<CategoryKey, TemplateGroup>;
      if (!parsed?.makan || !parsed?.parkir || !parsed?.lain) {
        return TEMPLATE_GROUPS;
      }
      return parsed;
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
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyRows));
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
          name: category === "parkir" ? "Biaya Parkir" : "Item Baru",
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
        item.id === id ? { ...item, name, updatedAt: new Date().toISOString() } : item,
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

    if (data.templateGroups?.makan && data.templateGroups?.parkir && data.templateGroups?.lain) {
      setTemplateGroups(data.templateGroups as Record<CategoryKey, TemplateGroup>);
      window.localStorage.setItem(
        TEMPLATE_STORAGE_KEY,
        JSON.stringify(data.templateGroups),
      );
    }

    if (Array.isArray(data.savedNotaTemplates)) {
      setSavedNotaTemplates(data.savedNotaTemplates as SavedNotaTemplate[]);
      window.localStorage.setItem(
        SAVED_NOTA_TEMPLATE_STORAGE_KEY,
        JSON.stringify(data.savedNotaTemplates),
      );
    }

    if (data.selectedTemplates?.makan && data.selectedTemplates?.parkir && data.selectedTemplates?.lain) {
      setSelectedTemplates(data.selectedTemplates as SelectedTemplates);
    }

    if (data.forms?.makan && data.forms?.parkir && data.forms?.lain) {
      setForms(data.forms as FormsState);
    }

    if (data.itemsByCategory?.makan && data.itemsByCategory?.parkir && data.itemsByCategory?.lain) {
      setItemsByCategory(data.itemsByCategory as ItemsState);
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

  const navItems: Array<{ key: PageKey; label: string }> = [
    { key: "dashboard", label: "Dashboard" },
    { key: "buat", label: "Buat Nota Baru" },
    { key: "riwayat", label: "Riwayat Cetak" },
    { key: "template", label: "Template Tersimpan" },
    { key: "settings", label: "Pengaturan" },
    { key: "cara", label: "Cara Menggunakan" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-5">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Desktop App Starter
            </div>
            <h1 className="mt-2 text-2xl font-bold">NotaPrint</h1>
            <div className="mt-1 text-xs font-medium text-slate-500">V.1.0.1</div>
            <p className="mt-2 text-sm text-slate-600">
              Dashboard + multi-step create note flow.
            </p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={classNames(
                  "w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                  page === item.key
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="p-6 lg:p-8">
          {page === "dashboard" && (
            <Dashboard
              goCreateNew={goCreateNew}
              setCategory={setCategory}
              templateGroups={templateGroups}
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
              deleteSavedTemplate={deleteSavedTemplate}
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
