const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const iconPath = path.join(
    __dirname,
    '..',
    'build',
    process.platform === 'win32' ? 'icon.ico' : 'icon.png'
  );

  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 1080,
    minHeight: 700,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  if (devServerUrl) {
    win.loadURL(devServerUrl);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  ipcMain.handle('print-receipt-native', async (_event, payload) => {
    const paperWidth = payload?.paperWidth === 80 ? 80 : 58;
    const pageWidthMm = paperWidth;
    const contentWidthMm = pageWidthMm;

    const imageDataUrl = String(payload?.imageDataUrl || '').trim();
    if (!imageDataUrl) {
      return { ok: false, error: 'EMPTY_IMAGE_PAYLOAD' };
    }

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { box-sizing: border-box; }
            @page { size: ${pageWidthMm}mm auto; margin: 0; }
            html, body { margin: 0; padding: 0; background: #fff; }
            body {
              width: ${pageWidthMm}mm;
              display: flex;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            img {
              width: ${contentWidthMm}mm;
              margin: 0;
              display: block;
              image-rendering: auto;
            }
          </style>
        </head>
        <body><img src="${imageDataUrl}" alt="Nota" /></body>
      </html>`;

    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        sandbox: true,
      },
    });

    try {
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      await new Promise((resolve, reject) => {
        win.webContents.print(
          {
            silent: false,
            printBackground: false,
            margins: { marginType: 'none' },
          },
          (success, failureReason) => {
            if (!success) {
              reject(new Error(failureReason || 'PRINT_FAILED'));
              return;
            }
            resolve(undefined);
          },
        );
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error?.message || 'PRINT_FAILED' };
    } finally {
      if (!win.isDestroyed()) {
        win.close();
      }
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
