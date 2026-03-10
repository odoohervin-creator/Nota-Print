import { BelanjaForm, LainForm, MakanForm, ParkirForm, PrintSnapshot } from "./types";
import { formatRupiah } from "./utils";

function padRight(value: string, len: number): string {
  const text = String(value || "");
  if (text.length >= len) return text.slice(0, len);
  return text + " ".repeat(len - text.length);
}

function padLeft(value: string, len: number): string {
  const text = String(value || "");
  if (text.length >= len) return text.slice(0, len);
  return " ".repeat(len - text.length) + text;
}

function wrapLine(text: string, width: number): string[] {
  const words = String(text || "-").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["-"];
}

function centered(text: string, width: number): string {
  const raw = String(text || "-");
  if (raw.length >= width) return raw.slice(0, width);
  const pad = Math.floor((width - raw.length) / 2);
  return `${" ".repeat(Math.max(0, pad))}${raw}`;
}

function kv(label: string, value: string, width: number): string {
  const leftWidth = Math.max(10, Math.floor(width * 0.45));
  const rightWidth = Math.max(8, width - leftWidth - 1);
  const left = padRight(label, leftWidth);
  const right = padLeft(value, rightWidth);
  return `${left} ${right}`;
}

export function buildReceiptText(snapshot: PrintSnapshot, paperWidth: 58 | 80): string {
  const lineWidth = paperWidth === 80 ? 36 : 25;
  const divider = "-".repeat(lineWidth);
  const { category, templateId } = snapshot;
  const form = snapshot.form as MakanForm | ParkirForm | LainForm | BelanjaForm;
  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.qty || 0) * Number(item.price || 0),
    0,
  );
  const extra = Number((form as any).biayaTambahan || 0);
  const total = subtotal + extra;
  const lines: string[] = [];

  lines.push(centered(form.toko || "-", lineWidth));
  wrapLine(form.alamat || "-", lineWidth).forEach((l) => lines.push(centered(l, lineWidth)));
  lines.push(divider);
  lines.push(kv("No Nota", form.nomor || "-", lineWidth));
  lines.push(kv("Tanggal", form.tanggal || "-", lineWidth));

  if (category === "makan") {
    const f = form as MakanForm;
    lines.push(kv("Jam", f.jam || "-", lineWidth));
    if (templateId === "makan-a") {
      lines.push(kv("Atas Nama", f.customer || "-", lineWidth));
      lines.push(kv("Layanan", f.layanan || "-", lineWidth));
    }
    lines.push(kv("Bayar", f.metodeBayar || "-", lineWidth));
  }

  if (category === "parkir") {
    const f = form as ParkirForm;
    lines.push(kv("Plat", f.platNomor || "-", lineWidth));
    lines.push(kv("Jenis", f.kendaraan || "-", lineWidth));
    if (templateId === "parkir-a") {
      lines.push(kv("Masuk", f.jamMasuk || "-", lineWidth));
      lines.push(kv("Keluar", f.jamKeluar || "-", lineWidth));
    }
  }

  if (category === "lain") {
    const f = form as LainForm;
    if (templateId === "lain-a" || templateId === "lain-c") {
      lines.push(kv(templateId === "lain-c" ? "Pembeli" : "Customer", f.pihak || "-", lineWidth));
    }
    lines.push(
      kv(
        templateId === "lain-b" ? "Layanan" : templateId === "lain-c" ? "Keperluan" : "Ket.",
        f.keterangan || "-",
        lineWidth,
      ),
    );
  }

  if (category === "belanja") {
    const f = form as BelanjaForm;
    if (templateId === "belanja-a") {
      lines.push(kv("Pembeli", f.pembeli || "-", lineWidth));
    }
    lines.push(kv("Bayar", f.metodeBayar || "-", lineWidth));
  }

  lines.push(divider);
  for (const item of items) {
    lines.push(item.name || "-");
    lines.push(kv(`${item.qty} x ${formatRupiah(item.price)}`, formatRupiah(item.qty * item.price), lineWidth));
  }
  lines.push(divider);
  lines.push(kv("Subtotal", formatRupiah(subtotal), lineWidth));
  if (
    category === "makan" ||
    category === "belanja" ||
    templateId === "parkir-a" ||
    templateId === "lain-a"
  ) {
    lines.push(kv((form as any).biayaTambahanLabel || "Biaya Tambahan", formatRupiah(extra), lineWidth));
  }
  lines.push(kv("TOTAL", formatRupiah(total), lineWidth));
  lines.push(divider);
  if (templateId !== "makan-b" && templateId !== "parkir-b" && templateId !== "lain-b" && templateId !== "belanja-b") {
    wrapLine(form.catatan || "-", lineWidth).forEach((l) => lines.push(centered(l, lineWidth)));
  }
  lines.push("");
  return lines.join("\n");
}
