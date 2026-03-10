const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  appVersion: '1.0.1',
  platform: process.platform,
  printReceiptNative: (payload) => ipcRenderer.invoke('print-receipt-native', payload),
});
