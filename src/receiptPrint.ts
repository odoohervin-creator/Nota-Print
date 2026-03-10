import {
  BelanjaForm,
  LainForm,
  MakanForm,
  PaperWidth,
  ParkirForm,
  PrintSnapshot,
} from "./types";
import { formatRupiah } from "./utils";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

function calcParkirDurationText(form: ParkirForm): string {
  const [inH = "0", inM = "0"] = (form.jamMasuk || "0:0").split(":");
  const [outH = "0", outM = "0"] = (form.jamKeluar || "0:0").split(":");
  const start = Number(inH) * 60 + Number(inM);
  const end = Number(outH) * 60 + Number(outM);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "-";
  const diff = end - start;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0 && m > 0) return `${h} Jam ${m} Menit`;
  if (h > 0) return `${h} Jam`;
  return `${m} Menit`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
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
}

function applyThermalEnhancement(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  logoAreas: Array<{ x: number; y: number; width: number; height: number }>,
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const textThreshold = 164;
  const logoThreshold = 152;
  const contrast = 1.12;

  const isInLogoArea = (x: number, y: number): boolean =>
    logoAreas.some(
      (area) =>
        x >= area.x &&
        x < area.x + area.width &&
        y >= area.y &&
        y < area.y + area.height,
    );

  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    const alpha = data[i + 3];
    if (alpha < 16) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
      continue;
    }

    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const contrasted = (gray - 128) * contrast + 128;
    const threshold = isInLogoArea(x, y) ? logoThreshold : textThreshold;
    const bw = contrasted < threshold ? 0 : 255;
    data[i] = bw;
    data[i + 1] = bw;
    data[i + 2] = bw;
    data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

export async function buildReceiptImageDataUrl(
  snapshot: PrintSnapshot,
  paperWidth: PaperWidth,
): Promise<string> {
  const { category, templateId } = snapshot;
  const form = snapshot.form as MakanForm | ParkirForm | LainForm | BelanjaForm;
  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.qty || 0) * Number(item.price || 0),
    0,
  );
  const extra = Number((form as any).biayaTambahan || 0);
  const total = subtotal + extra;

  const isMakanTemplateA = category === "makan" && templateId === "makan-a";
  const isMakanTemplateB = category === "makan" && templateId === "makan-b";
  const isParkirTemplateA = category === "parkir" && templateId === "parkir-a";
  const isParkirTemplateB = category === "parkir" && templateId === "parkir-b";
  const isLainTemplateA = category === "lain" && templateId === "lain-a";
  const isLainTemplateB = category === "lain" && templateId === "lain-b";
  const isLainTemplateC = category === "lain" && templateId === "lain-c";
  const isBelanjaTemplateA =
    category === "belanja" && templateId === "belanja-a";
  const isBelanjaTemplateB =
    category === "belanja" && templateId === "belanja-b";
  const isTemplateA = templateId.endsWith("-a");
  const isTemplateB = templateId.endsWith("-b");
  const isTemplateC = templateId.endsWith("-c");

  const infoRows: Array<{ label: string; value: string }> = [
    { label: "No Nota", value: form.nomor || "-" },
    { label: "Tanggal", value: form.tanggal || "-" },
  ];

  if (isMakanTemplateA) {
    infoRows.push(
      { label: "Jam", value: (form as MakanForm).jam || "-" },
      { label: "Atas Nama", value: (form as MakanForm).customer || "-" },
      { label: "Layanan", value: (form as MakanForm).layanan || "-" },
      { label: "Bayar", value: (form as MakanForm).metodeBayar || "-" },
    );
  } else if (isMakanTemplateB) {
    infoRows.push(
      { label: "Jam", value: (form as MakanForm).jam || "-" },
      { label: "Bayar", value: (form as MakanForm).metodeBayar || "-" },
    );
  }

  if (isParkirTemplateA) {
    infoRows.push(
      { label: "Plat No", value: (form as ParkirForm).platNomor || "-" },
      { label: "Kendaraan", value: (form as ParkirForm).kendaraan || "-" },
      { label: "Masuk", value: (form as ParkirForm).jamMasuk || "-" },
      { label: "Keluar", value: (form as ParkirForm).jamKeluar || "-" },
    );
  } else if (isParkirTemplateB) {
    infoRows.push(
      { label: "Plat No", value: (form as ParkirForm).platNomor || "-" },
      { label: "Kendaraan", value: (form as ParkirForm).kendaraan || "-" },
    );
  }

  if (isLainTemplateA) {
    infoRows.push(
      { label: "Customer", value: (form as LainForm).pihak || "-" },
      { label: "Ket.", value: (form as LainForm).keterangan || "-" },
    );
  } else if (isLainTemplateB) {
    infoRows.push({ label: "Layanan", value: (form as LainForm).keterangan || "-" });
  } else if (isLainTemplateC) {
    infoRows.push(
      { label: "Pembeli", value: (form as LainForm).pihak || "-" },
      { label: "Keperluan", value: (form as LainForm).keterangan || "-" },
    );
  }
  if (isBelanjaTemplateA) {
    infoRows.push(
      { label: "Pembeli", value: (form as BelanjaForm).pembeli || "-" },
      { label: "Bayar", value: (form as BelanjaForm).metodeBayar || "-" },
    );
  } else if (isBelanjaTemplateB) {
    infoRows.push({ label: "Bayar", value: (form as BelanjaForm).metodeBayar || "-" });
  }

  const renderScale = paperWidth === 58 ? 4 : 2;
  const fontScale = 1.22;
  const spacingScale = 1.24;
  const fs = (value: number) => Math.round(value * fontScale);
  const sp = (value: number) => Math.round(value * spacingScale);
  const paperPx = paperWidth === 80 ? 640 : 464;
  const padding = paperWidth === 80 ? 26 : 22;
  const innerWidth = paperPx - padding * 2;
  const logoAreas: Array<{ x: number; y: number; width: number; height: number }> = [];
  const estimatedHeight =
    sp(520) +
    infoRows.length * sp(30) +
    items.length * sp(56) +
    ((form.catatan ? Math.ceil(form.catatan.length / 28) : 1) * sp(26));
  const canvas = document.createElement("canvas");
  canvas.width = paperPx * renderScale;
  canvas.height = estimatedHeight * renderScale;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Gagal menyiapkan canvas cetak");
  }
  ctx.scale(renderScale, renderScale);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, paperPx, estimatedHeight);
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";
  const receiptFont =
    "'Consolas', 'Lucida Console', 'DejaVu Sans Mono', 'Liberation Mono', monospace";
  ctx.font = `${fs(19)}px ${receiptFont}`;
  let y = sp(16);
  const weightNormal = "600";
  const weightBold = "800";

  const logoSrc = String((form as any).logoDataUrl || "");
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

        const imageData = lctx.getImageData(0, 0, logoCanvas.width, logoCanvas.height);
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
        const drawX = (paperPx - w) / 2;
        const drawY = y;
        ctx.drawImage(logoCanvas, drawX, drawY, w, h);
        logoAreas.push({ x: drawX, y: drawY, width: w, height: h });
      } else {
        const drawX = (paperPx - w) / 2;
        const drawY = y;
        ctx.drawImage(logo, drawX, drawY, w, h);
        logoAreas.push({ x: drawX, y: drawY, width: w, height: h });
      }
      y += h + sp(8);
    } catch {
      // ignore logo load errors
    }
  }

  const centerLine = (text: string, bold = false, size = fs(19)) => {
    ctx.font = `${bold ? weightBold : weightNormal} ${size}px ${receiptFont}`;
    const t = String(text || "-");
    const w = ctx.measureText(t).width;
    const x = (paperPx - w) / 2;
    ctx.fillText(t, x, y);
    if (bold) {
      // Overdraw to force visible bold even on printers/fonts with weak weight variants.
      ctx.fillText(t, x + 0.8, y);
    }
    y += size >= fs(20) ? sp(34) : sp(28);
  };

  const divider = (bold = false) => {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = bold ? 2 : 1;
    ctx.setLineDash(
      bold ? [] : isTemplateB ? [] : isTemplateC ? [2, 2] : [4, 3],
    );
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(paperPx - padding, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    y += sp(13);
  };

  const row = (left: string, right: string, bold = false) => {
    ctx.font = `${bold ? weightBold : weightNormal} ${fs(18)}px ${receiptFont}`;
    const l = String(left || "-");
    const r = String(right || "-");
    ctx.fillText(l, padding, y);
    const rw = ctx.measureText(r).width;
    ctx.fillText(r, paperPx - padding - rw, y);
    y += sp(30);
  };

  centerLine(form.toko || "-", true, isTemplateB ? fs(20) : fs(22));
  if (!isTemplateB) {
    wrapText(ctx, form.alamat || "-", innerWidth).forEach((line) => centerLine(line));
  } else if (form.alamat) {
    centerLine(form.alamat, false, fs(18));
  }
  y += sp(2);

  divider();
  infoRows.forEach((info) => row(info.label, info.value));
  divider();

  items.forEach((item) => {
    if (isTemplateB) {
      row(item.name || "-", formatRupiah(item.qty * item.price), true);
      ctx.font = `${weightNormal} ${fs(16)}px ${receiptFont}`;
      ctx.fillStyle = "#000000";
      ctx.fillText(`${item.qty} x ${formatRupiah(item.price)}`, padding, y);
      ctx.fillStyle = "#000000";
      y += sp(26);
      return;
    }
    const itemName = isTemplateC ? `* ${item.name || "-"}` : item.name || "-";
    ctx.font = `${weightBold} ${fs(19)}px ${receiptFont}`;
    ctx.fillText(itemName, padding, y);
    ctx.fillText(itemName, padding + 0.8, y);
    y += sp(28);
    row(`${item.qty} x ${formatRupiah(item.price)}`, formatRupiah(item.qty * item.price));
    y += isTemplateC ? sp(6) : sp(4);
  });

  divider(true);
  row("Subtotal", formatRupiah(subtotal));
  row(form.biayaTambahanLabel || "Biaya Tambahan", formatRupiah(extra));
  divider();
  row("TOTAL", formatRupiah(total), true);
  divider(true);

  if (!(isMakanTemplateB || isLainTemplateB || isParkirTemplateB || isBelanjaTemplateB)) {
    wrapText(ctx, form.catatan || "-", innerWidth).forEach((line) => centerLine(line));
  }
  y += sp(8);

  if (isParkirTemplateA || isParkirTemplateB) {
    const parkirForm = form as ParkirForm;
    const parkirDurationText = calcParkirDurationText(parkirForm);
    logoAreas.length = 0;

    y = sp(16);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, paperPx, estimatedHeight);
    ctx.fillStyle = "#000000";

    if (logoSrc) {
      try {
        const logo = await loadImage(logoSrc);
        const maxW = 180;
        const maxH = 80;
        const ratio = Math.min(maxW / logo.width, maxH / logo.height, 1);
        const w = logo.width * ratio;
        const h = logo.height * ratio;
        const drawX = (paperPx - w) / 2;
        const drawY = y;
        ctx.drawImage(logo, drawX, drawY, w, h);
        logoAreas.push({ x: drawX, y: drawY, width: w, height: h });
        y += h + sp(8);
      } catch {
        // ignore logo load errors
      }
    }

    centerLine(parkirForm.toko || "-", true, isTemplateB ? fs(17) : fs(18));
    if (isParkirTemplateA && parkirForm.alamat) {
      wrapText(ctx, parkirForm.alamat, innerWidth).forEach((line) => centerLine(line));
    }
    divider();

    if (isParkirTemplateA) {
      row("No Nota", parkirForm.nomor || "-");
      row("Tanggal", parkirForm.tanggal || "-");
      y += sp(4);
      row("Plat", parkirForm.platNomor || "-");
      row("Jenis", parkirForm.kendaraan || "-");
      y += sp(4);
      row("Masuk", parkirForm.jamMasuk || "-");
      row("Keluar", parkirForm.jamKeluar || "-");
      row("Durasi", parkirDurationText);
      divider();
      row((items[0]?.name || "Biaya Parkir").replace(/\s+/g, " "), formatRupiah(subtotal));
      divider();
      row("TOTAL", formatRupiah(total), true);
    }

    if (isParkirTemplateB) {
      row("No", parkirForm.nomor || "-");
      centerLine(parkirForm.tanggal || "-");
      divider();
      row("Plat", parkirForm.platNomor || "-");
      centerLine(parkirForm.kendaraan || "-");
      divider();
      row("Parkir", formatRupiah(subtotal));
      divider();
      row("TOTAL", formatRupiah(total), true);
    }

    divider(true);
    const closing =
      isParkirTemplateA
        ? parkirForm.catatan || "Terima kasih"
        : parkirForm.catatan || "Simpan nota ini";
    wrapText(ctx, closing, innerWidth).forEach((line) => centerLine(line));
    y += sp(8);
  }

  const cropped = document.createElement("canvas");
  const cropHeight = Math.max(sp(200), Math.min(estimatedHeight, y + sp(10)));
  cropped.width = paperPx * renderScale;
  cropped.height = cropHeight * renderScale;
  const cctx = cropped.getContext("2d");
  if (!cctx) {
    throw new Error("Gagal menyiapkan hasil cetak");
  }
  cctx.fillStyle = "#ffffff";
  cctx.fillRect(0, 0, cropped.width, cropped.height);
  cctx.drawImage(canvas, 0, 0);
  applyThermalEnhancement(
    cctx,
    cropped.width,
    cropped.height,
    logoAreas.map((area) => ({
      x: Math.round(area.x * renderScale),
      y: Math.round(area.y * renderScale),
      width: Math.round(area.width * renderScale),
      height: Math.round(area.height * renderScale),
    })),
  );

  return cropped.toDataURL("image/png");
}
