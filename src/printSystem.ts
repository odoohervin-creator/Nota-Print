import { buildReceiptImageDataUrl } from "./receiptPrint";
import { PaperWidth, PrintSnapshot } from "./types";

type NativePrintResult = {
  ok: boolean;
  error?: string;
};

type NativePrinterBridge = {
  platform?: string;
  printReceiptNative?: (payload: {
    paperWidth: PaperWidth;
    imageDataUrl?: string;
  }) => Promise<NativePrintResult>;
};

type NativeAttemptResult = {
  attempted: boolean;
  ok: boolean;
  error?: string;
};

function printInPopupWindow(dataUrl: string, paperWidth: PaperWidth): Promise<void> {
  return new Promise((resolve, reject) => {
    const desktop = (window as unknown as { desktop?: NativePrinterBridge }).desktop;
    const isWindows = desktop?.platform === "win32";
    const pageWidthMm = paperWidth;
    const contentWidthMm = isWindows ? pageWidthMm - 2 : pageWidthMm;
    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            * { box-sizing: border-box; }
            @page { size: ${pageWidthMm}mm auto; margin: 0; }
            html, body { margin: 0; padding: 0; background: #fff; }
            body {
              margin: 0 auto;
              width: ${pageWidthMm}mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet {
              width: ${pageWidthMm}mm;
              display: flex;
              justify-content: center;
            }
            img {
              width: ${contentWidthMm}mm;
              margin: 0;
              display: block;
              image-rendering: auto;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <img id="receipt" src="${dataUrl}" alt="Nota" />
          </div>
          <script>
            const done = () => {
              setTimeout(() => window.close(), 200);
            };
            window.addEventListener('afterprint', done);
            const image = document.getElementById('receipt');
            image.addEventListener('load', () => {
              setTimeout(() => window.print(), 120);
            });
          </script>
        </body>
      </html>`;

    const popup = window.open("", "_blank", "width=480,height=720");
    if (!popup) {
      reject(new Error("Pop-up cetak diblokir browser"));
      return;
    }

    popup.document.open();
    popup.document.write(html);
    popup.document.close();

    const timeoutId = window.setTimeout(() => {
      try {
        popup.close();
      } catch {
        // ignore
      }
      reject(new Error("Timeout saat membuka dialog cetak"));
    }, 15000);

    const poll = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(poll);
        window.clearTimeout(timeoutId);
        resolve();
      }
    }, 200);
  });
}

async function tryNativePrint(
  dataUrl: string,
  paperWidth: PaperWidth,
): Promise<NativeAttemptResult> {
  const desktop = (window as unknown as { desktop?: NativePrinterBridge }).desktop;
  if (!desktop?.printReceiptNative) {
    return { attempted: false, ok: false };
  }

  const result = await desktop.printReceiptNative({
    paperWidth,
    imageDataUrl: dataUrl,
  });
  return {
    attempted: true,
    ok: Boolean(result?.ok),
    error: result?.error,
  };
}

export async function printReceiptSnapshot(
  snapshot: PrintSnapshot,
  paperWidth: PaperWidth,
): Promise<void> {
  const dataUrl = await buildReceiptImageDataUrl(snapshot, paperWidth);
  const nativeResult = await tryNativePrint(dataUrl, paperWidth);
  if (nativeResult.attempted && nativeResult.ok) {
    return;
  }
  if (nativeResult.attempted && !nativeResult.ok) {
    throw new Error(nativeResult.error || "NATIVE_PRINT_FAILED");
  }

  await printInPopupWindow(dataUrl, paperWidth);
}
