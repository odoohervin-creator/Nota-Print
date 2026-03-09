import React from "react";
import { CategoryKey, TemplateGroup } from "../types";

interface MasterTemplatePageProps {
  templateGroups: Record<CategoryKey, TemplateGroup>;
  setTemplateGroups: React.Dispatch<
    React.SetStateAction<Record<CategoryKey, TemplateGroup>>
  >;
  saveTemplateGroups: () => void;
  resetTemplateGroups: () => void;
  isDirty: boolean;
}

export default function MasterTemplatePage({
  templateGroups,
  setTemplateGroups,
  saveTemplateGroups,
  resetTemplateGroups,
  isDirty,
}: MasterTemplatePageProps) {
  const updateGroup = (
    category: CategoryKey,
    updater: (group: TemplateGroup) => TemplateGroup,
  ) => {
    setTemplateGroups((prev) => ({
      ...prev,
      [category]: updater(prev[category]),
    }));
  };

  const addTemplate = (category: CategoryKey) => {
    updateGroup(category, (group) => ({
      ...group,
      templates: [
        ...group.templates,
        {
          id: `${category}-${Date.now()}`,
          name: `Template ${group.label}`,
          desc: "",
        },
      ],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Master Template</h2>
          <p className="mt-1 text-sm text-slate-600">
            Kelola nama kategori, ikon, dan daftar template yang digunakan saat
            membuat nota.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveTemplateGroups}
            disabled={!isDirty}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${
              isDirty ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            Simpan Template
          </button>
          <button
            onClick={resetTemplateGroups}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
          >
            Reset Default
          </button>
        </div>
      </div>

      <div className="text-sm text-slate-500">
        {isDirty ? "Perubahan template belum disimpan." : "Template sudah tersimpan."}
      </div>

      <div className="space-y-5">
        {(Object.keys(templateGroups) as CategoryKey[]).map((category) => {
          const group = templateGroups[category];
          return (
            <section
              key={category}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-4 md:grid-cols-[100px_1fr]">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Icon
                  </label>
                  <input
                    value={group.icon}
                    onChange={(e) =>
                      updateGroup(category, (prev) => ({
                        ...prev,
                        icon: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xl outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Nama Kategori
                  </label>
                  <input
                    value={group.label}
                    onChange={(e) =>
                      updateGroup(category, (prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nama Template</th>
                      <th className="px-4 py-3 font-medium">Deskripsi</th>
                      <th className="px-4 py-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.templates.map((template, index) => (
                      <tr key={template.id} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <input
                            value={template.name}
                            onChange={(e) =>
                              updateGroup(category, (prev) => ({
                                ...prev,
                                templates: prev.templates.map((item) =>
                                  item.id === template.id
                                    ? { ...item, name: e.target.value }
                                    : item,
                                ),
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={template.desc}
                            onChange={(e) =>
                              updateGroup(category, (prev) => ({
                                ...prev,
                                templates: prev.templates.map((item) =>
                                  item.id === template.id
                                    ? { ...item, desc: e.target.value }
                                    : item,
                                ),
                              }))
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              updateGroup(category, (prev) => ({
                                ...prev,
                                templates:
                                  prev.templates.length > 1
                                    ? prev.templates.filter(
                                        (item) => item.id !== template.id,
                                      )
                                    : prev.templates,
                              }))
                            }
                            disabled={group.templates.length === 1}
                            className={`rounded-xl px-3 py-2 text-xs ${
                              group.templates.length === 1
                                ? "bg-slate-100 text-slate-400"
                                : "border border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                          >
                            Hapus
                          </button>
                          <div className="mt-1 text-[11px] text-slate-400">
                            #{index + 1}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => addTemplate(category)}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800"
                >
                  + Tambah Template
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
