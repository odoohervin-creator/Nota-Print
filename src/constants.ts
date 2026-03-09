import {
  CategoryKey,
  TemplateGroup,
  SelectedTemplates,
  ItemsState,
  FormsState,
  HistoryRow,
} from "./types";

export const TEMPLATE_GROUPS: Record<CategoryKey, TemplateGroup> = {
  makan: {
    label: "Nota Makan",
    icon: "🍽️",
    templates: [
      {
        id: "makan-a",
        name: "Template Nota Makan A",
        desc: "Standar restoran / rumah makan",
      },
      {
        id: "makan-b",
        name: "Template Nota Makan B",
        desc: "Versi ringkas untuk warung / kafe",
      },
    ],
  },
  belanja: {
    label: "Nota Belanja",
    icon: "🛒",
    templates: [
      {
        id: "belanja-a",
        name: "Template Nota Belanja A",
        desc: "Format belanja umum dengan data pembeli",
      },
      {
        id: "belanja-b",
        name: "Template Nota Belanja B",
        desc: "Versi ringkas untuk pembelian cepat",
      },
    ],
  },
  parkir: {
    label: "Nota Parkir",
    icon: "🅿️",
    templates: [
      {
        id: "parkir-a",
        name: "Template Nota Parkir A",
        desc: "Format formal dengan jam masuk/keluar",
      },
      {
        id: "parkir-b",
        name: "Template Nota Parkir B",
        desc: "Versi cepat dan sederhana",
      },
    ],
  },
  lain: {
    label: "Nota Lain",
    icon: "🧾",
    templates: [
      { id: "lain-a", name: "Nota Lain A (Nota Umum)", desc: "Nota umum standar" },
      { id: "lain-b", name: "Nota Lain B (Jasa)", desc: "Khusus service / jasa" },
      {
        id: "lain-c",
        name: "Nota Lain C (Reimbursement)",
        desc: "Nota pengganti kantor / reimbursement",
      },
    ].map((t) => ({ ...t, desc: t.desc || "" })),
  },
};

export const DEFAULT_TEMPLATE_BY_CATEGORY: SelectedTemplates = {
  makan: "makan-a",
  parkir: "parkir-a",
  lain: "lain-a",
  belanja: "belanja-a",
};

export const INITIAL_ITEMS: ItemsState = {
  makan: [
    { id: 1, name: "Nasi Goreng Special", qty: 2, price: 28000 },
    { id: 2, name: "Es Teh Manis", qty: 2, price: 8000 },
  ],
  parkir: [{ id: 1, name: "Parkir Mobil", qty: 1, price: 10000 }],
  lain: [{ id: 1, name: "Biaya Administrasi", qty: 1, price: 35000 }],
  belanja: [
    { id: 1, name: "ATK Kantor", qty: 1, price: 120000 },
    { id: 2, name: "Kertas HVS", qty: 2, price: 55000 },
  ],
};

export const INITIAL_FORM: FormsState = {
  makan: {
    toko: "Warung Makan Sederhana Jaya",
    alamat: "Jl. Slamet Riyadi No. 88, Solo",
    nomor: "MKN-2026-0048",
    tanggal: "2026-03-09",
    jam: "12:48",
    customer: "Bapak Dimas",
    layanan: "Dine In",
    metodeBayar: "Tunai",
    logoDataUrl: "",
    catatan: "Ini adalah nota pengganti perusahaan.",
    biayaTambahanLabel: "Service",
    biayaTambahan: 10000,
  },
  parkir: {
    toko: "Parkir City Mall",
    alamat: "Area Basement Timur",
    nomor: "PRK-2026-0182",
    tanggal: "2026-03-09",
    logoDataUrl: "",
    jamMasuk: "10:15",
    jamKeluar: "13:40",
    platNomor: "AD 1234 XY",
    kendaraan: "Mobil",
    catatan: "Nota parkir pengganti.",
    biayaTambahanLabel: "Biaya Lain",
    biayaTambahan: 0,
  },
  lain: {
    toko: "CV Sumber Makmur Teknik",
    alamat: "Jl. Industri No. 18, Solo",
    nomor: "NON-2026-0031",
    tanggal: "2026-03-09",
    logoDataUrl: "",
    pihak: "PT Karya Presisi Nusantara",
    keterangan: "Pembelian umum / nota pengganti",
    catatan: "Barang yang sudah dibeli tidak dapat ditukar.",
    biayaTambahanLabel: "Biaya Lain",
    biayaTambahan: 0,
  },
  belanja: {
    toko: "Toko Serba Ada",
    alamat: "Jl. Gatot Subroto No. 21, Solo",
    nomor: "BLJ-2026-0001",
    tanggal: "2026-03-09",
    logoDataUrl: "",
    pembeli: "PT Indotech Trimitra Abadi",
    metodeBayar: "Transfer",
    catatan: "Nota belanja pengganti perusahaan.",
    biayaTambahanLabel: "Ongkir",
    biayaTambahan: 0,
  },
};

export const STEP_LABELS = [
  "Kategori",
  "Template",
  "Informasi Utama",
  "Detail Transaksi",
  "Preview & Simpan",
];

export const HISTORY_SAMPLES: HistoryRow[] = [
  {
    id: "sample-mkn-2026-0048",
    no: "MKN-2026-0048",
    jenis: "Nota Makan",
    toko: "Warung Makan Sederhana Jaya",
    total: 82000,
    status: "Sudah dicetak",
    tanggal: "2026-03-09",
  },
  {
    id: "sample-prk-2026-0182",
    no: "PRK-2026-0182",
    jenis: "Nota Parkir",
    toko: "Parkir City Mall",
    total: 10000,
    status: "Draft",
    tanggal: "2026-03-09",
  },
  {
    id: "sample-non-2026-0031",
    no: "NON-2026-0031",
    jenis: "Nota Lain",
    toko: "CV Sumber Makmur Teknik",
    total: 35000,
    status: "Sudah dicetak",
    tanggal: "2026-03-09",
  },
  {
    id: "sample-blj-2026-0001",
    no: "BLJ-2026-0001",
    jenis: "Nota Belanja",
    toko: "Toko Serba Ada",
    total: 230000,
    status: "Sudah disimpan",
    tanggal: "2026-03-09",
  },
];
