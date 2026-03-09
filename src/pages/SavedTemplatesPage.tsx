import React from "react";
import { SavedNotaTemplate } from "../types";

interface SavedTemplatesPageProps {
  templates: SavedNotaTemplate[];
  onUseTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onRenameTemplate: (id: string, name: string) => void;
}

const categoryLabel: Record<SavedNotaTemplate["category"], string> = {
  makan: "Nota Makan",
  parkir: "Nota Parkir",
  lain: "Nota Lain",
  belanja: "Nota Belanja",
};

export default function SavedTemplatesPage({
  templates,
  onUseTemplate,
  onDeleteTemplate,
  onRenameTemplate,
}: SavedTemplatesPageProps) {
  const [query, setQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [editingTemplate, setEditingTemplate] =
    React.useState<SavedNotaTemplate | null>(null);
  const [editingName, setEditingName] = React.useState("");

  const filteredTemplates = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((template) => {
      const byCategory =
        categoryFilter === "all" || template.category === categoryFilter;
      const byQuery =
        !q ||
        template.name.toLowerCase().includes(q) ||
        categoryLabel[template.category].toLowerCase().includes(q);
      return byCategory && byQuery;
    });
  }, [templates, query, categoryFilter]);

  const closeEditModal = () => {
    setEditingTemplate(null);
    setEditingName("");
  };

  const submitEditTemplate = () => {
    if (!editingTemplate) return;
    const nextName = editingName.trim();
    if (!nextName) return;
    onRenameTemplate(editingTemplate.id, nextName);
    closeEditModal();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Template Tersimpan</h2>
        <p className="mt-1 text-sm text-slate-600">
          Simpan pola nota yang sering dipakai, lalu pakai ulang kapan saja.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama template"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="makan">Nota Makan</option>
            <option value="parkir">Nota Parkir</option>
            <option value="lain">Nota Lain</option>
            <option value="belanja">Nota Belanja</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama Template</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Template Dasar</th>
                <th className="px-4 py-3">Update</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((template) => (
                <tr key={template.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">{template.name}</td>
                  <td className="px-4 py-3">{categoryLabel[template.category]}</td>
                  <td className="px-4 py-3">{template.templateId}</td>
                  <td className="px-4 py-3">{template.updatedAt.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onUseTemplate(template.id)}
                        className="rounded-xl bg-[#ef4444] px-3 py-1 text-xs font-medium text-white hover:bg-[#dc2626]"
                      >
                        Pakai
                      </button>
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setEditingName(template.name);
                        }}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        Edit Nama
                      </button>
                      <button
                        onClick={() => onDeleteTemplate(template.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTemplates.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Belum ada template tersimpan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Edit Nama Template
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Ubah nama template tersimpan.
            </p>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nama Template
              </label>
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                placeholder="Masukkan nama template"
                autoFocus
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={submitEditTemplate}
                disabled={!editingName.trim()}
                className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                  editingName.trim()
                    ? "bg-[#ef4444] text-white hover:bg-[#dc2626]"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
