const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  appVersion: '1.0.1',
  platform: process.platform,
});
