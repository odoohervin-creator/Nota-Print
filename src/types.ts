export type CategoryKey = "makan" | "parkir" | "lain" | "belanja";

export type TemplateItem = {
  id: string;
  name: string;
  desc: string;
};

export type ItemRow = {
  id: number;
  name: string;
  qty: number;
  price: number;
};

export type TemplateGroup = {
  label: string;
  icon: string;
  templates: TemplateItem[];
};

export type MakanForm = {
  toko: string;
  alamat: string;
  nomor: string;
  tanggal: string;
  jam: string;
  customer: string;
  layanan: string;
  metodeBayar: string;
  logoDataUrl: string;
  catatan: string;
  biayaTambahanLabel: string;
  biayaTambahan: number;
};

export type ParkirForm = {
  toko: string;
  alamat: string;
  nomor: string;
  tanggal: string;
  logoDataUrl: string;
  jamMasuk: string;
  jamKeluar: string;
  platNomor: string;
  kendaraan: string;
  catatan: string;
  biayaTambahanLabel: string;
  biayaTambahan: number;
};

export type LainForm = {
  toko: string;
  alamat: string;
  nomor: string;
  tanggal: string;
  logoDataUrl: string;
  pihak: string;
  keterangan: string;
  catatan: string;
  biayaTambahanLabel: string;
  biayaTambahan: number;
};

export type FormsState = {
  makan: MakanForm;
  parkir: ParkirForm;
  lain: LainForm;
  belanja: BelanjaForm;
};

export type ItemsState = Record<CategoryKey, ItemRow[]>;

export type SelectedTemplates = Record<CategoryKey, string>;

export type PrintSnapshot = {
  category: CategoryKey;
  templateId: string;
  form: MakanForm | ParkirForm | LainForm | BelanjaForm;
  items: ItemRow[];
};

export type PageKey =
  | "dashboard"
  | "buat"
  | "riwayat"
  | "cara"
  | "template"
  | "settings";

export type HistoryRow = {
  id: string;
  no: string;
  jenis: string;
  toko: string;
  total: number;
  status: string;
  tanggal: string;
  logoDataUrl?: string;
  printSnapshot?: PrintSnapshot;
};

export type PaperWidth = 58 | 80;

export type AppSettings = {
  paperWidth: PaperWidth;
  printerName: string;
  storeName: string;
  storeAddress: string;
};

export type SavedNotaTemplate = {
  id: string;
  name: string;
  category: CategoryKey;
  templateId: string;
  form: MakanForm | ParkirForm | LainForm | BelanjaForm;
  items: ItemRow[];
  updatedAt: string;
};

export type BelanjaForm = {
  toko: string;
  alamat: string;
  nomor: string;
  tanggal: string;
  logoDataUrl: string;
  pembeli: string;
  metodeBayar: string;
  catatan: string;
  biayaTambahanLabel: string;
  biayaTambahan: number;
};
