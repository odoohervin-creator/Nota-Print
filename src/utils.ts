export function formatRupiah(value: number): string {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

export function classNames(
  ...classes: Array<string | false | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function printImageDataUrl(dataUrl: string, paperWidthMm: 58 | 80): void {
  const frame = document.createElement("iframe");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.setAttribute("aria-hidden", "true");
  document.body.appendChild(frame);

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * { box-sizing: border-box; }
          @page { size: ${paperWidthMm}mm auto; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
            display: flex;
            justify-content: center;
          }
          img {
            width: ${paperWidthMm}mm;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="Nota" />
      </body>
    </html>
  `;

  const doc = frame.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(frame);
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  window.setTimeout(() => {
    const win = frame.contentWindow;
    if (!win) {
      if (document.body.contains(frame)) {
        document.body.removeChild(frame);
      }
      return;
    }
    win.focus();
    win.print();
    window.setTimeout(() => {
      if (document.body.contains(frame)) {
        document.body.removeChild(frame);
      }
    }, 1000);
  }, 350);
}
